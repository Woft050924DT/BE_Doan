import prisma from '../config/database';

const bannerSelect = {
  banner_id: true,
  title: true,
  image_url: true,
  mobile_image_url: true,
  link_url: true,
  position: true,
  display_order: true,
  start_date: true,
  end_date: true,
  is_active: true,
  click_count: true,
  created_at: true,
  updated_at: true,
} as const;

export const getAdminBanners = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  position?: string;
}) => {
  const { page = 1, limit = 20, search, status, position } = filters;
  const skip = (Number(page) - 1) * Number(limit);
  const now = new Date();

  const where: any = {};

  if (status === 'active') {
    where.is_active = true;
    where.OR = [
      { start_date: null },
      { start_date: { lte: now } },
    ];
    where.AND = [
      {
        OR: [
          { end_date: null },
          { end_date: { gte: now } },
        ],
      },
    ];
  } else if (status === 'inactive') {
    where.is_active = false;
  } else if (status === 'scheduled') {
    where.is_active = true;
    where.start_date = { gt: now };
  } else if (status === 'expired') {
    where.end_date = { lt: now };
  }

  if (position) {
    where.position = position;
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [banners, total] = await Promise.all([
    prisma.banners.findMany({
      where,
      select: bannerSelect,
      skip,
      take: Number(limit),
      orderBy: { display_order: 'asc' },
    }),
    prisma.banners.count({ where }),
  ]);

  return {
    data: banners.map((b) => ({
      banner_id: b.banner_id,
      title: b.title,
      image_url: b.image_url,
      mobile_image_url: b.mobile_image_url || '',
      link: b.link_url || '',
      position: b.position || 'main',
      device: 'all' as const,
      status: computeBannerStatus(b, now) as 'active' | 'inactive',
      start_date: b.start_date ? b.start_date.toISOString() : '',
      end_date: b.end_date ? b.end_date.toISOString() : '',
      sort_order: b.display_order ?? 0,
      click_count: b.click_count ?? 0,
      is_active: b.is_active ?? true,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const computeBannerStatus = (b: any, now: Date) => {
  if (!b.is_active) return 'inactive';
  if (b.start_date && now < b.start_date) return 'scheduled';
  if (b.end_date && now > b.end_date) return 'expired';
  return 'active';
};

export const createBanner = async (data: {
  title: string;
  image_url: string;
  mobile_image_url?: string;
  link?: string;
  position?: string;
  device?: string;
  start_date?: string;
  end_date?: string;
  sort_order?: number;
}) => {
  return prisma.banners.create({
    data: {
      title: data.title,
      image_url: data.image_url,
      mobile_image_url: data.mobile_image_url || null,
      link_url: data.link || null,
      position: data.position || 'main',
      display_order: data.sort_order ?? 0,
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      is_active: true,
    },
    select: bannerSelect,
  });
};

export const updateBanner = async (
  bannerId: string,
  data: Partial<{
    title: string;
    image_url: string;
    mobile_image_url: string;
    link: string;
    position: string;
    start_date: string;
    end_date: string;
    sort_order: number;
  }>
) => {
  const banner = await prisma.banners.findUnique({ where: { banner_id: bannerId } });
  if (!banner) throw new Error('Banner not found');

  return prisma.banners.update({
    where: { banner_id: bannerId },
    data: {
      title: data.title,
      image_url: data.image_url,
      mobile_image_url: data.mobile_image_url,
      link_url: data.link,
      position: data.position,
      display_order: data.sort_order,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    },
    select: bannerSelect,
  });
};

export const deleteBanner = async (bannerId: string) => {
  const banner = await prisma.banners.findUnique({ where: { banner_id: bannerId } });
  if (!banner) throw new Error('Banner not found');

  await prisma.banners.delete({ where: { banner_id: bannerId } });
  return { message: 'Banner deleted successfully' };
};

export const toggleBannerStatus = async (bannerId: string) => {
  const banner = await prisma.banners.findUnique({ where: { banner_id: bannerId } });
  if (!banner) throw new Error('Banner not found');

  return prisma.banners.update({
    where: { banner_id: bannerId },
    data: { is_active: !banner.is_active },
    select: bannerSelect,
  });
};
