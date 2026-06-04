import prisma from '../config/database';

const brandSelect = {
  brand_id: true,
  name: true,
  slug: true,
  logo_url: true,
  description: true,
  website: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  _count: { select: { products: true } },
} as const;

export const getAdminBrands = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const { page = 1, limit = 20, search, status } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (status === 'active') {
    where.is_active = true;
  } else if (status === 'inactive') {
    where.is_active = false;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [brands, total] = await Promise.all([
    prisma.brands.findMany({
      where,
      select: brandSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.brands.count({ where }),
  ]);

  return {
    data: brands.map((b) => ({
      brand_id: b.brand_id,
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url || '',
      product_count: b._count.products,
      featured: false,
      status: (b.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getBrandById = async (brandId: string) => {
  const brand = await prisma.brands.findUnique({
    where: { brand_id: brandId },
    select: brandSelect,
  });
  if (!brand) throw new Error('Brand not found');
  return {
    brand_id: brand.brand_id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url || '',
    product_count: brand._count.products,
    featured: false,
    status: (brand.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
  };
};

export const createBrand = async (data: {
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  is_active?: boolean;
}) => {
  const slug =
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9\u00e0-\u024f\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  const brand = await prisma.brands.create({
    data: {
      name: data.name,
      slug,
      logo_url: data.logo_url || null,
      description: data.description || null,
      website: data.website || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
    },
    select: brandSelect,
  });

  return {
    brand_id: brand.brand_id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url || '',
    product_count: brand._count.products,
    featured: false,
    status: (brand.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
  };
};

export const updateBrand = async (
  brandId: string,
  data: Partial<{
    name: string;
    logo_url: string;
    description: string;
    website: string;
    is_active: boolean;
  }>
) => {
  const brand = await prisma.brands.findUnique({ where: { brand_id: brandId } });
  if (!brand) throw new Error('Brand not found');

  const updated = await prisma.brands.update({
    where: { brand_id: brandId },
    data: {
      name: data.name,
      logo_url: data.logo_url,
      description: data.description,
      website: data.website,
      is_active: data.is_active,
    },
    select: brandSelect,
  });

  return {
    brand_id: updated.brand_id,
    name: updated.name,
    slug: updated.slug,
    logo_url: updated.logo_url || '',
    product_count: updated._count.products,
    featured: false,
    status: (updated.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
  };
};

export const deleteBrand = async (brandId: string) => {
  const brand = await prisma.brands.findUnique({ where: { brand_id: brandId } });
  if (!brand) throw new Error('Brand not found');
  await prisma.brands.delete({ where: { brand_id: brandId } });
  return { message: 'Brand deleted successfully' };
};

export const toggleFeatured = async (brandId: string) => {
  const brand = await prisma.brands.findUnique({ where: { brand_id: brandId } });
  if (!brand) throw new Error('Brand not found');
  return { message: 'Featured toggle not implemented — add featured column to brands table first' };
};
