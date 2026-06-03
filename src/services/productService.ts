import prisma from '../config/database';

const brandSelect = {
  brand_id: true,
  name: true,
  slug: true,
  logo_url: true,
} as const;

const categorySelect = {
  category_id: true,
  name: true,
  slug: true,
} as const;

export const getProductList = async (filters: any) => {
  const { category_id, brand_id, featured, best_seller, new_arrival, q, sort, page = 1, limit = 20 } = filters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    status: 'published',
  };

  if (category_id) where.category_id = category_id;
  if (brand_id) where.brand_id = brand_id;
  if (featured === 'true') where.featured = true;
  if (best_seller === 'true') where.best_seller = true;
  if (new_arrival === 'true') where.new_arrival = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { short_description: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { created_at: 'desc' };
  if (sort === 'newest') orderBy = { created_at: 'desc' };
  else if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'sold') orderBy = { view_count: 'desc' };

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      skip,
      take,
      include: {
        categories: { select: categorySelect },
        brands: { select: brandSelect },
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
      orderBy,
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

export const getProductDetails = async (id: string) => {
  const product = await prisma.products.findUnique({
    where: { product_id: id },
    include: {
      categories: { select: categorySelect },
      brands: { select: { ...brandSelect, logo_url: true } },
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

  await prisma.products.update({
    where: { product_id: id },
    data: { view_count: { increment: 1 } },
  });

  return product;
};

export const getBrands = async () => {
  return prisma.brands.findMany({
    where: { is_active: true },
    select: brandSelect,
    orderBy: { name: 'asc' },
  });
};

export const getProductReviews = async (productId: string) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  return prisma.product_reviews.findMany({
    where: { product_id: productId, is_approved: true },
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
  });
};

export const addProductReview = async (
  productId: string,
  userId: string,
  data: { rating: number; title?: string; comment?: string; images?: string[]; order_id?: string }
) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  return prisma.product_reviews.create({
    data: {
      product_id: productId,
      user_id: userId,
      order_id: data.order_id || null,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment || null,
      images: data.images || [],
      is_approved: false,
      is_verified_purchase: data.order_id ? true : false,
    },
    include: {
      users: {
        select: {
          user_id: true,
          full_name: true,
          avatar_url: true,
        },
      },
    },
  });
};

export const markReviewHelpful = async (reviewId: string) => {
  return prisma.product_reviews.update({
    where: { review_id: reviewId },
    data: { helpful_count: { increment: 1 } },
  });
};
