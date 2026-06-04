import prisma from '../config/database';

const reviewSelect = {
  review_id: true,
  product_id: true,
  user_id: true,
  order_id: true,
  rating: true,
  title: true,
  comment: true,
  images: true,
  is_verified_purchase: true,
  is_approved: true,
  helpful_count: true,
  created_at: true,
} as const;

export const getAdminReviews = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  approved?: boolean;
}) => {
  const { page = 1, limit = 20, search, approved } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (approved !== undefined) {
    where.is_approved = approved;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.product_reviews.findMany({
      where,
      select: reviewSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.product_reviews.count({ where }),
  ]);

  const enriched = await Promise.all(
    reviews.map(async (r) => {
      const [product, user] = await Promise.all([
        r.product_id
          ? prisma.products.findUnique({
              where: { product_id: r.product_id },
              select: { name: true, product_images: { where: { is_primary: true }, take: 1 } },
            })
          : null,
        r.user_id
          ? prisma.users.findUnique({
              where: { user_id: r.user_id },
              select: { full_name: true, avatar_url: true },
            })
          : null,
      ]);

      return {
        review_id: r.review_id,
        product_name: product?.name || '',
        product_image: product?.product_images?.[0]?.image_url || '',
        user_name: user?.full_name || 'Khách hàng',
        user_avatar: user?.avatar_url || '',
        rating: r.rating ?? 0,
        title: r.title || '',
        comment: r.comment || '',
        is_verified_purchase: r.is_verified_purchase ?? false,
        is_approved: r.is_approved ?? false,
        helpful_count: r.helpful_count ?? 0,
        created_at: r.created_at ? r.created_at.toISOString() : '',
      };
    })
  );

  return {
    data: enriched,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const approveReview = async (reviewId: string) => {
  const review = await prisma.product_reviews.update({
    where: { review_id: reviewId },
    data: { is_approved: true },
    select: reviewSelect,
  });
  const product = review.product_id
    ? await prisma.products.findUnique({
        where: { product_id: review.product_id },
        select: { name: true, product_images: { where: { is_primary: true }, take: 1 } },
      })
    : null;
  const user = review.user_id
    ? await prisma.users.findUnique({
        where: { user_id: review.user_id },
        select: { full_name: true, avatar_url: true },
      })
    : null;
  return {
    review_id: review.review_id,
    product_name: product?.name || '',
    product_image: product?.product_images?.[0]?.image_url || '',
    user_name: user?.full_name || 'Khách hàng',
    user_avatar: user?.avatar_url || '',
    rating: review.rating ?? 0,
    title: review.title || '',
    comment: review.comment || '',
    is_verified_purchase: review.is_verified_purchase ?? false,
    is_approved: review.is_approved ?? false,
    helpful_count: review.helpful_count ?? 0,
    created_at: review.created_at ? review.created_at.toISOString() : '',
  };
};

export const rejectReview = async (reviewId: string) => {
  const review = await prisma.product_reviews.update({
    where: { review_id: reviewId },
    data: { is_approved: false },
    select: reviewSelect,
  });
  const product = review.product_id
    ? await prisma.products.findUnique({
        where: { product_id: review.product_id },
        select: { name: true, product_images: { where: { is_primary: true }, take: 1 } },
      })
    : null;
  const user = review.user_id
    ? await prisma.users.findUnique({
        where: { user_id: review.user_id },
        select: { full_name: true, avatar_url: true },
      })
    : null;
  return {
    review_id: review.review_id,
    product_name: product?.name || '',
    product_image: product?.product_images?.[0]?.image_url || '',
    user_name: user?.full_name || 'Khách hàng',
    user_avatar: user?.avatar_url || '',
    rating: review.rating ?? 0,
    title: review.title || '',
    comment: review.comment || '',
    is_verified_purchase: review.is_verified_purchase ?? false,
    is_approved: review.is_approved ?? false,
    helpful_count: review.helpful_count ?? 0,
    created_at: review.created_at ? review.created_at.toISOString() : '',
  };
};

export const deleteReview = async (reviewId: string) => {
  await prisma.product_reviews.delete({ where: { review_id: reviewId } });
  return { message: 'Review deleted successfully' };
};
