import prisma from '../config/database';

export const getProfileStats = async (userId: string) => {
  const [totalOrders, pendingOrders, totalReviews] = await Promise.all([
    prisma.orders.count({ where: { user_id: userId } }),
    prisma.orders.count({
      where: { user_id: userId, status: { in: ['pending', 'processing'] } },
    }),
    prisma.product_reviews.count({ where: { user_id: userId, is_approved: true } }),
  ]);

  const totalSpentResult = await prisma.orders.aggregate({
    where: { user_id: userId, payment_status: 'paid' },
    _sum: { total_amount: true },
  });

  return {
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    total_spent: Number(totalSpentResult._sum.total_amount ?? 0),
    total_reviews: totalReviews,
  };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.users.findUnique({ where: { user_id: userId } });
  if (!user) throw new Error('Profile not found');

  const bcrypt = await import('bcrypt');
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) throw new Error('Current password is incorrect');

  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { user_id: userId },
    data: { password_hash: newHash, updated_at: new Date() },
  });

  return { message: 'Password changed successfully' };
};
