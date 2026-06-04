import prisma from '../config/database';

export const getBanners = async (position?: string) => {
  const now = new Date();

  const where: any = {
    is_active: true,
    AND: [
      { OR: [{ start_date: null }, { start_date: { lte: now } }] },
      { OR: [{ end_date: null }, { end_date: { gte: now } }] },
    ],
  };

  if (position) {
    where.position = position;
  }

  return prisma.banners.findMany({
    where,
    orderBy: { display_order: 'asc' },
  });
};
