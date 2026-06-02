import prisma from '../config/database';

export const getCategories = async () => {
  const categories = await prisma.categories.findMany({
    orderBy: { name: 'asc' },
  });
  return categories;
};
