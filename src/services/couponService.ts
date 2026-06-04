import prisma from '../config/database';

export const validateCoupon = async (code: string, subtotal: number, userId?: string) => {
  if (!code) {
    throw new Error('Coupon code is required');
  }

  const coupon = await prisma.coupons.findUnique({
    where: { code },
  });

  if (!coupon || !coupon.is_active) {
    throw new Error('Invalid coupon code');
  }

  const now = new Date();
  if (now < coupon.valid_from || now > coupon.valid_to) {
    throw new Error('Coupon is expired or not yet valid');
  }

  if (coupon.usage_limit && (coupon.usage_count ?? 0) >= coupon.usage_limit) {
    throw new Error('Coupon usage limit reached');
  }

  if (coupon.min_purchase_amount && subtotal < Number(coupon.min_purchase_amount)) {
    throw new Error('Order does not meet minimum purchase for this coupon');
  }

  if (userId && coupon.usage_limit_per_user) {
    const userUsage = await prisma.coupon_usage.count({
      where: { coupon_id: coupon.coupon_id, user_id: userId },
    });

    if (userUsage >= coupon.usage_limit_per_user) {
      throw new Error('Coupon usage limit per user reached');
    }
  }

  let discount_amount = 0;
  if (coupon.discount_type === 'percentage') {
    discount_amount = subtotal * (Number(coupon.discount_value) / 100);
  } else {
    discount_amount = Number(coupon.discount_value);
  }

  if (coupon.max_discount_amount && discount_amount > Number(coupon.max_discount_amount)) {
    discount_amount = Number(coupon.max_discount_amount);
  }

  if (discount_amount > subtotal) {
    discount_amount = subtotal;
  }

  return {
    valid: true,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: Number(coupon.discount_value),
    discount_amount,
    description: coupon.description,
  };
};
