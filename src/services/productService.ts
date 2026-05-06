import prisma from '../config/database';

export const getProductList = async (filters: any) => {
  const { category_id, brand_id, featured, best_seller, new_arrival, page = 1, limit = 20 } = filters;

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
