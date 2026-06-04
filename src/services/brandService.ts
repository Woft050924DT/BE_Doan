import prisma from '../config/database';
import { slugify } from '../utils/slugify';

const ensureUniqueBrandSlug = async (baseSlug: string, excludeId?: string) => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.brands.findFirst({
      where: {
        slug,
        ...(excludeId ? { brand_id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export const getBrands = async (admin = false) => {
  return prisma.brands.findMany({
    where: admin ? {} : { is_active: true },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });
};

export const createBrand = async (data: {
  name: string;
  slug?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  is_active?: boolean;
}) => {
  if (!data.name?.trim()) throw new Error('Brand name is required');

  const baseSlug = slugify(data.slug || data.name);
  const slug = await ensureUniqueBrandSlug(baseSlug || `brand-${Date.now()}`);

  const existingName = await prisma.brands.findFirst({
    where: { name: { equals: data.name.trim(), mode: 'insensitive' } },
  });
  if (existingName) throw new Error('Brand name already exists');

  return prisma.brands.create({
    data: {
      name: data.name.trim(),
      slug,
      logo_url: data.logo_url?.trim() || null,
      description: data.description?.trim() || null,
      website: data.website?.trim() || null,
      is_active: data.is_active ?? true,
    },
    include: { _count: { select: { products: true } } },
  });
};

export const updateBrand = async (
  brandId: string,
  data: {
    name?: string;
    slug?: string;
    logo_url?: string;
    description?: string;
    website?: string;
    is_active?: boolean;
  }
) => {
  const existing = await prisma.brands.findUnique({ where: { brand_id: brandId } });
  if (!existing) throw new Error('Brand not found');

  let slug = existing.slug;
  if (data.slug?.trim()) {
    slug = await ensureUniqueBrandSlug(slugify(data.slug), brandId);
  } else if (data.name?.trim() && data.name.trim() !== existing.name) {
    slug = await ensureUniqueBrandSlug(slugify(data.name), brandId);
  }

  if (data.name?.trim()) {
    const duplicate = await prisma.brands.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: 'insensitive' },
        brand_id: { not: brandId },
      },
    });
    if (duplicate) throw new Error('Brand name already exists');
  }

  return prisma.brands.update({
    where: { brand_id: brandId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      slug,
      ...(data.logo_url !== undefined ? { logo_url: data.logo_url?.trim() || null } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.website !== undefined ? { website: data.website?.trim() || null } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date(),
    },
    include: { _count: { select: { products: true } } },
  });
};

export const deleteBrand = async (brandId: string) => {
  const existing = await prisma.brands.findUnique({
    where: { brand_id: brandId },
    include: { _count: { select: { products: true } } },
  });
  if (!existing) throw new Error('Brand not found');

  if (existing._count.products > 0) {
    return prisma.brands.update({
      where: { brand_id: brandId },
      data: { is_active: false, updated_at: new Date() },
      include: { _count: { select: { products: true } } },
    });
  }

  return prisma.brands.delete({
    where: { brand_id: brandId },
  });
};
