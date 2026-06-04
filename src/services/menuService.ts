import prisma from '../config/database';

export const getMenus = async (location?: string) => {
  const where: any = {};
  if (location) {
    where.location = location;
  }

  return prisma.menus.findMany({
    where,
    include: {
      menu_items: {
        where: { is_active: true, parent_id: null },
        orderBy: { display_order: 'asc' },
        include: {
          other_menu_items: {
            where: { is_active: true },
            orderBy: { display_order: 'asc' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
};
