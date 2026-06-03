import prisma from '../config/database';

export const validateCoupon = async (
  couponCode: string,
  cartTotal: number,
  userId?: string
) => {
  const coupon = await prisma.coupons.findUnique({
    where: { code: couponCode },
  });

  if (!coupon) {
    return { valid: false, coupon_code: couponCode, message: 'Mã giảm giá không tồn tại' };
  }

  if (!coupon.is_active) {
    return { valid: false, coupon_code: couponCode, message: 'Mã giảm giá đã bị vô hiệu hóa' };
  }

  const now = new Date();
  if (now < coupon.valid_from || now > coupon.valid_to) {
    return { valid: false, coupon_code: couponCode, message: 'Mã giảm giá đã hết hạn' };
  }

  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, coupon_code: couponCode, message: 'Mã giảm giá đã hết lượt sử dụng' };
  }

  if (coupon.min_purchase_amount && cartTotal < Number(coupon.min_purchase_amount)) {
    return {
      valid: false,
      coupon_code: couponCode,
      message: `Giá trị đơn hàng tối thiểu là ${Number(coupon.min_purchase_amount).toLocaleString('vi-VN')}đ`,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = cartTotal * (Number(coupon.discount_value) / 100);
    if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
      discountAmount = Number(coupon.max_discount_amount);
    }
  } else {
    discountAmount = Number(coupon.discount_value);
  }

  return {
    valid: true,
    coupon_code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: Number(coupon.discount_value),
    min_order_amount: Number(coupon.min_purchase_amount ?? 0),
    max_discount: Number(coupon.max_discount_amount ?? 0),
    discount_amount: discountAmount,
    message: 'Mã giảm giá hợp lệ',
  };
};

export const getUserCoupons = async (userId: string) => {
  const userCoupons = await prisma.user_coupons.findMany({
    where: { user_id: userId },
    include: { coupons: true },
    orderBy: { assigned_at: 'desc' },
  });

  const now = new Date();
  return userCoupons.map((uc) => {
    const coupon = uc.coupons;
    return {
      user_coupon_id: uc.user_coupon_id,
      coupon_id: coupon.coupon_id,
      code: coupon.code,
      title: coupon.description || coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      min_order_amount: Number(coupon.min_purchase_amount ?? 0),
      max_discount: Number(coupon.max_discount_amount ?? 0),
      expires_at: coupon.valid_to.toISOString(),
      is_used: coupon.usage_count > 0,
      is_expired: now > coupon.valid_to,
    };
  });
};
