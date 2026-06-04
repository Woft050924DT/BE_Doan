import prisma from '../config/database';

export const createReview = async (
  userId: string,
  productId: string,
  data: { rating: number; title?: string; comment?: string; order_id?: string }
) => {
  const { rating, title, comment, order_id } = data;

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await prisma.products.findUnique({
    where: { product_id: productId },
  });

  if (!product || product.status !== 'published') {
    throw new Error('Product not found');
  }

  const review = await prisma.product_reviews.create({
    data: {
      product_id: productId,
      user_id: userId,
      order_id: order_id || null,
      rating,
      title,
      comment,
      is_verified_purchase: !!order_id,
      is_approved: false,
    },
    include: {
      users: {
        select: { user_id: true, full_name: true, avatar_url: true },
      },
    },
  });

  return review;
};
