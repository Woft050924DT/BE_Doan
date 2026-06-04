import prisma from '../config/database';
import { slugify } from '../utils/slugify';
import { assertValidSellingPrice } from '../utils/pricing';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80';

const syncProductImages = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string,
  urls: string[],
  altText: string
) => {
  const cleaned = urls.map((u) => u.trim()).filter(Boolean);
  await tx.product_images.deleteMany({ where: { product_id: productId } });
  if (cleaned.length === 0) return;
  for (let i = 0; i < cleaned.length; i++) {
    await tx.product_images.create({
      data: {
        product_id: productId,
        image_url: cleaned[i],
        alt_text: altText,
        is_primary: i === 0,
        display_order: i,
      },
    });
  }
};

const resolveCategoryId = async (category_id?: string, category_slug?: string) => {
  if (category_id) return category_id;
  if (!category_slug) return undefined;
  const cat = await prisma.categories.findFirst({
    where: { slug: String(category_slug).trim(), is_active: true },
    select: { category_id: true },
  });
  return cat?.category_id;
};

export const getProductList = async (filters: any) => {
  const {
    category_id,
    category_slug,
    brand_id,
    featured,
    best_seller,
    new_arrival,
    search,
    page = 1,
    limit = 20,
    admin,
    status,
  } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};

  if (admin === 'true') {
    if (status) where.status = status;
  } else {
    where.status = 'published';
  }

  const resolvedCategoryId = await resolveCategoryId(category_id, category_slug);
  if (resolvedCategoryId) {
    where.category_id = resolvedCategoryId;
  } else if (category_slug && !category_id) {
    return {
      products: [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0,
      },
    };
  }
  if (brand_id) where.brand_id = brand_id;
  if (featured === 'true') where.featured = true;
  if (best_seller === 'true') where.best_seller = true;
  if (new_arrival === 'true') where.new_arrival = true;

  if (search && String(search).trim()) {
    const term = String(search).trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: term, mode: 'insensitive' } },
      { sku: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      skip,
      take,
      include: {
        categories: {
          select: {
            category_id: true,
            name: true,
            slug: true,
          },
        },
        brands: {
          select: {
            brand_id: true,
            name: true,
            slug: true,
          },
        },
        product_images: {
          where: { is_primary: true as any },
          take: 1,
        },
        product_variants: {
          where: { is_active: true },
          select: {
            variant_id: true,
            name: true,
            price: true,
            compare_price: true,
            stock_quantity: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.products.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.products.findUnique({
    where: { slug },
    select: { product_id: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return getProductDetails(product.product_id);
};

export const getProductDetails = async (id: string) => {
  const product = await prisma.products.findUnique({
    where: { product_id: id },
    include: {
      categories: {
        select: {
          category_id: true,
          name: true,
          slug: true,
        },
      },
      brands: {
        select: {
          brand_id: true,
          name: true,
          slug: true,
          logo_url: true,
        },
      },
      product_images: {
        orderBy: { display_order: 'asc' as any },
      },
      product_variants: {
        where: { is_active: true },
      },
      product_reviews: {
        where: { is_approved: true },
        include: {
          users: {
            select: {
              user_id: true,
              full_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Increment view count
  await prisma.products.update({
    where: { product_id: id },
    data: { view_count: { increment: 1 } },
  });

  return product;
};

const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.products.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
};

export const createProduct = async (
  data: {
  name: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  short_description?: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  status?: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  image_url?: string;
  image_urls?: string[];
  stock_quantity?: number;
  },
  userId?: string
) => {
  const { name, sku, price } = data;

  if (!name?.trim()) throw new Error('Product name is required');
  if (!sku?.trim()) throw new Error('SKU is required');
  if (!Number.isFinite(Number(price)) || Number(price) < 0) {
    throw new Error('Price must be a valid non-negative number');
  }

  assertValidSellingPrice(Number(price), data.cost_price);

  const existingSku = await prisma.products.findUnique({ where: { sku: sku.trim() } });
  if (existingSku) throw new Error('SKU already exists');

  const baseSlug = slugify(name);
  const slug = await ensureUniqueSlug(baseSlug || `product-${Date.now()}`);

  const status = data.status || 'draft';
  const isPublished = status === 'published';

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.products.create({
      data: {
        name: name.trim(),
        slug,
        sku: sku.trim(),
        short_description: data.short_description?.trim() || null,
        description: data.description?.trim() || null,
        price,
        compare_price: data.compare_price ?? null,
        cost_price: data.cost_price ?? null,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        status,
        featured: data.featured ?? false,
        best_seller: data.best_seller ?? false,
        new_arrival: data.new_arrival ?? false,
        published_at: isPublished ? new Date() : null,
      },
    });

    const imageUrls =
      data.image_urls?.map((u) => u.trim()).filter(Boolean) ||
      (data.image_url?.trim() ? [data.image_url.trim()] : [DEFAULT_IMAGE]);

    await syncProductImages(tx, created.product_id, imageUrls, name.trim());

    const variantSku = `${sku.trim()}-STD`;
    await tx.product_variants.create({
      data: {
        product_id: created.product_id,
        sku: variantSku,
        name: 'Mặc định',
        price,
        compare_price: data.compare_price ?? null,
        cost_price: data.cost_price ?? null,
        stock_quantity: 0,
        is_active: true,
      },
    });

    return created;
  });

  return getProductDetails(product.product_id);
};

export const updateProduct = async (
  productId: string,
  data: {
    name?: string;
    sku?: string;
    price?: number;
    compare_price?: number;
    cost_price?: number;
    short_description?: string;
    description?: string;
    category_id?: string | null;
    brand_id?: string | null;
    status?: string;
    featured?: boolean;
    best_seller?: boolean;
    new_arrival?: boolean;
    image_url?: string;
    image_urls?: string[];
    stock_quantity?: number;
  }
) => {
  const existing = await prisma.products.findUnique({
    where: { product_id: productId },
    include: {
      product_variants: { where: { is_active: true }, orderBy: { created_at: 'asc' }, take: 1 },
      product_images: { orderBy: { display_order: 'asc' } },
    },
  });

  if (!existing) throw new Error('Product not found');

  if (data.sku?.trim() && data.sku.trim() !== existing.sku) {
    const duplicate = await prisma.products.findFirst({
      where: { sku: data.sku.trim(), product_id: { not: productId } },
    });
    if (duplicate) throw new Error('SKU already exists');
  }

  let slug = existing.slug;
  if (data.name?.trim() && data.name.trim() !== existing.name) {
    const baseSlug = slugify(data.name);
    let candidate = baseSlug;
    let counter = 1;
    while (
      await prisma.products.findFirst({
        where: { slug: candidate, product_id: { not: productId } },
      })
    ) {
      candidate = `${baseSlug}-${counter}`;
      counter += 1;
    }
    slug = candidate;
  }

  const status = data.status ?? existing.status ?? 'draft';
  const isPublished = status === 'published';

  const nextPrice = data.price !== undefined ? Number(data.price) : Number(existing.price);
  const nextCost =
    data.cost_price !== undefined
      ? data.cost_price != null
        ? Number(data.cost_price)
        : 0
      : existing.cost_price != null
        ? Number(existing.cost_price)
        : 0;
  assertValidSellingPrice(nextPrice, nextCost);

  await prisma.$transaction(async (tx) => {
    await tx.products.update({
      where: { product_id: productId },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        slug,
        ...(data.sku !== undefined ? { sku: data.sku.trim() } : {}),
        ...(data.short_description !== undefined
          ? { short_description: data.short_description?.trim() || null }
          : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.compare_price !== undefined ? { compare_price: data.compare_price } : {}),
        ...(data.cost_price !== undefined ? { cost_price: data.cost_price } : {}),
        ...(data.category_id !== undefined ? { category_id: data.category_id || null } : {}),
        ...(data.brand_id !== undefined ? { brand_id: data.brand_id || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.featured !== undefined ? { featured: data.featured } : {}),
        ...(data.best_seller !== undefined ? { best_seller: data.best_seller } : {}),
        ...(data.new_arrival !== undefined ? { new_arrival: data.new_arrival } : {}),
        ...(data.status !== undefined && isPublished && !existing.published_at
          ? { published_at: new Date() }
          : {}),
        updated_at: new Date(),
      },
    });

    const defaultVariant = existing.product_variants[0];
    if (defaultVariant) {
      await tx.product_variants.update({
        where: { variant_id: defaultVariant.variant_id },
        data: {
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.compare_price !== undefined ? { compare_price: data.compare_price } : {}),
          ...(data.cost_price !== undefined ? { cost_price: data.cost_price } : {}),
          ...(data.sku !== undefined ? { sku: `${data.sku.trim()}-STD` } : {}),
        },
      });
    }

    if (data.image_urls !== undefined) {
      const urls = data.image_urls.map((u) => u.trim()).filter(Boolean);
      if (urls.length > 0) {
        await syncProductImages(tx, productId, urls, data.name?.trim() || existing.name);
      }
    } else if (data.image_url?.trim()) {
      const existingUrls = existing.product_images.map((img) => img.image_url);
      const urls = existingUrls.length > 0 ? [...existingUrls] : [];
      if (urls.length > 0) urls[0] = data.image_url.trim();
      else urls.push(data.image_url.trim());
      await syncProductImages(tx, productId, urls, data.name?.trim() || existing.name);
    }
  });

  return getProductDetails(productId);
};

export const deleteProduct = async (productId: string) => {
  const existing = await prisma.products.findUnique({
    where: { product_id: productId },
    include: { _count: { select: { order_items: true } } },
  });

  if (!existing) throw new Error('Product not found');

  if (existing._count.order_items > 0) {
    await prisma.products.update({
      where: { product_id: productId },
      data: { status: 'archived', updated_at: new Date() },
    });
    return { success: true, deleted: false, archived: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.cart_items.deleteMany({ where: { product_id: productId } });
    await tx.inventory_transactions.deleteMany({ where: { product_id: productId } });
    await tx.product_reviews.deleteMany({ where: { product_id: productId } });
    await tx.product_images.deleteMany({ where: { product_id: productId } });
    await tx.product_variants.deleteMany({ where: { product_id: productId } });
    await tx.products.delete({ where: { product_id: productId } });
  });

  return { success: true, deleted: true, archived: false };
};
