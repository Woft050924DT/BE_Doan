import prisma from '../config/database';

const categorySelect = {
  category_id: true,
  parent_id: true,
  name: true,
  slug: true,
  description: true,
  image_url: true,
  icon: true,
  display_order: true,
  is_active: true,
  meta_title: true,
  meta_description: true,
  meta_keywords: true,
  created_at: true,
  updated_at: true,
  _count: { select: { products: true } },
  categories: { select: { name: true }, take: 1 },
} as const;

export const getAdminCategories = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { page = 1, limit = 20, search } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.categories.findMany({
      where,
      select: categorySelect,
      skip,
      take: Number(limit),
      orderBy: { display_order: 'asc' },
    }),
    prisma.categories.count({ where }),
  ]);

    return {
      data: categories.map((c) => ({
      category_id: c.category_id,
      parent_id: c.parent_id,
      parent_name: c.categories?.[0]?.name ?? null,
      name: c.name,
      slug: c.slug,
      product_count: c._count.products,
      sort_order: c.display_order ?? 0,
      status: (c.is_active ?? true) ? 'active' : 'inactive',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const createCategory = async (data: {
  name: string;
  parent_id?: string;
  description?: string;
  image_url?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}) => {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9\u00e0-\u024f\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now().toString(36);

  return prisma.categories.create({
    data: {
      name: data.name,
      parent_id: data.parent_id || null,
      slug,
      description: data.description || null,
      image_url: data.image_url || null,
      icon: data.icon || null,
      display_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      meta_keywords: data.meta_keywords || null,
    },
    select: categorySelect,
  });
};

export const updateCategory = async (
  categoryId: string,
  data: Partial<{
    name: string;
    parent_id: string;
    description: string;
    image_url: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  }>
) => {
  const category = await prisma.categories.findUnique({
    where: { category_id: categoryId },
  });
  if (!category) throw new Error('Category not found');

  const updateData: any = { ...data };
  if (data.sort_order !== undefined) {
    updateData.display_order = data.sort_order;
    delete updateData.sort_order;
  }

  return prisma.categories.update({
    where: { category_id: categoryId },
    data: updateData,
    select: categorySelect,
  });
};

export const deleteCategory = async (categoryId: string) => {
  const category = await prisma.categories.findUnique({
    where: { category_id: categoryId },
  });
  if (!category) throw new Error('Category not found');

  await prisma.categories.delete({ where: { category_id: categoryId } });
  return { message: 'Category deleted successfully' };
};
