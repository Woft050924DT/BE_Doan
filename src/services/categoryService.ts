import prisma from '../config/database';
import { slugify } from '../utils/slugify';

const ensureUniqueCategorySlug = async (baseSlug: string, excludeId?: string) => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.categories.findFirst({
      where: {
        slug,
        ...(excludeId ? { category_id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export const getCategories = async (admin = false) => {
  return prisma.categories.findMany({
    where: admin ? {} : { is_active: true },
    orderBy: [{ display_order: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: {
          products: admin ? true : { where: { status: 'published' } },
        },
      },
    },
  });
};

export const createCategory = async (data: {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  icon?: string;
  display_order?: number;
  parent_id?: string | null;
  is_active?: boolean;
}) => {
  if (!data.name?.trim()) throw new Error('Category name is required');

  const baseSlug = slugify(data.slug || data.name);
  const slug = await ensureUniqueCategorySlug(baseSlug || `category-${Date.now()}`);

  const existingName = await prisma.categories.findFirst({
    where: { name: { equals: data.name.trim(), mode: 'insensitive' } },
  });
  if (existingName) throw new Error('Category name already exists');

  if (data.parent_id) {
    const parent = await prisma.categories.findUnique({ where: { category_id: data.parent_id } });
    if (!parent) throw new Error('Parent category not found');
  }

  return prisma.categories.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      image_url: data.image_url?.trim() || null,
      icon: data.icon?.trim() || null,
      display_order: data.display_order ?? 0,
      parent_id: data.parent_id || null,
      is_active: data.is_active ?? true,
    },
    include: { _count: { select: { products: true } } },
  });
};

export const updateCategory = async (
  categoryId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    icon?: string;
    display_order?: number;
    parent_id?: string | null;
    is_active?: boolean;
  }
) => {
  const existing = await prisma.categories.findUnique({ where: { category_id: categoryId } });
  if (!existing) throw new Error('Category not found');

  if (data.parent_id === categoryId) {
    throw new Error('Category cannot be its own parent');
  }

  if (data.parent_id) {
    const parent = await prisma.categories.findUnique({ where: { category_id: data.parent_id } });
    if (!parent) throw new Error('Parent category not found');
  }

  let slug = existing.slug;
  if (data.slug?.trim()) {
    slug = await ensureUniqueCategorySlug(slugify(data.slug), categoryId);
  } else if (data.name?.trim() && data.name.trim() !== existing.name) {
    slug = await ensureUniqueCategorySlug(slugify(data.name), categoryId);
  }

  if (data.name?.trim()) {
    const duplicate = await prisma.categories.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: 'insensitive' },
        category_id: { not: categoryId },
      },
    });
    if (duplicate) throw new Error('Category name already exists');
  }

  return prisma.categories.update({
    where: { category_id: categoryId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      slug,
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.image_url !== undefined ? { image_url: data.image_url?.trim() || null } : {}),
      ...(data.icon !== undefined ? { icon: data.icon?.trim() || null } : {}),
      ...(data.display_order !== undefined ? { display_order: data.display_order } : {}),
      ...(data.parent_id !== undefined ? { parent_id: data.parent_id || null } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date(),
    },
    include: { _count: { select: { products: true } } },
  });
};

export const deleteCategory = async (categoryId: string) => {
  const existing = await prisma.categories.findUnique({
    where: { category_id: categoryId },
    include: {
      _count: { select: { products: true } },
      other_categories: { select: { category_id: true } },
    },
  });
  if (!existing) throw new Error('Category not found');

  if (existing.other_categories.length > 0) {
    throw new Error('Cannot delete category that has subcategories');
  }

  if (existing._count.products > 0) {
    return prisma.categories.update({
      where: { category_id: categoryId },
      data: { is_active: false, updated_at: new Date() },
      include: { _count: { select: { products: true } } },
    });
  }

  return prisma.categories.delete({
    where: { category_id: categoryId },
  });
};
