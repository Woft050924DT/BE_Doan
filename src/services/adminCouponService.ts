import prisma from '../config/database';

const couponSelect = {
  coupon_id: true,
  code: true,
  description: true,
  discount_type: true,
  discount_value: true,
  min_purchase_amount: true,
  max_discount_amount: true,
  usage_limit: true,
  usage_count: true,
  valid_from: true,
  valid_to: true,
  is_active: true,
  created_at: true,
  updated_at: true,
} as const;

const computeStatus = (coupon: any) => {
  const now = new Date();
  if (!coupon.is_active) return 'disabled';
  if (coupon.valid_from && now < coupon.valid_from) return 'scheduled';
  if (coupon.valid_to && now > coupon.valid_to) return 'expired';
  return 'active';
};

export const getAdminCoupons = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_active?: boolean;
}) => {
  const { page = 1, limit = 20, search, status, is_active } = filters;
  const skip = (Number(page) - 1) * Number(limit);
  const now = new Date();

  const where: any = {};

  if (is_active !== undefined) {
    where.is_active = is_active;
  } else if (status) {
    if (status === 'active') {
      where.is_active = true;
      where.valid_from = { lte: now };
      where.valid_to = { gte: now };
    } else if (status === 'scheduled') {
      where.is_active = true;
      where.valid_from = { gt: now };
    } else if (status === 'expired') {
      where.valid_to = { lt: now };
    } else if (status === 'disabled') {
      where.is_active = false;
    }
  }

  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [coupons, total] = await Promise.all([
    prisma.coupons.findMany({
      where,
      select: couponSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.coupons.count({ where }),
  ]);

    return {
      data: coupons.map((c) => ({
        coupon_id: c.coupon_id,
        code: c.code,
        title: c.description || c.code,
        discount_type: c.discount_type as 'percentage' | 'fixed',
        discount_value: Number(c.discount_value),
        min_order_amount: Number(c.min_purchase_amount ?? 0),
        max_discount: Number(c.max_discount_amount ?? 0),
        usage_limit: c.usage_limit ?? 0,
        used_count: c.usage_count ?? 0,
        start_date: c.valid_from ? c.valid_from.toISOString() : new Date().toISOString(),
        end_date: c.valid_to ? c.valid_to.toISOString() : new Date().toISOString(),
        status: computeStatus(c),
        is_featured: false,
      })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const createCoupon = async (data: {
  code: string;
  title?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate: string;
  endDate: string;
}) => {
  const existing = await prisma.coupons.findUnique({ where: { code: data.code } });
  if (existing) throw new Error('Mã giảm giá đã tồn tại');

  return prisma.coupons.create({
    data: {
      code: data.code,
      description: data.title || null,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      min_purchase_amount: data.minOrder || 0,
      max_discount_amount: data.maxDiscount || null,
      usage_limit: data.usageLimit || null,
      valid_from: new Date(data.startDate),
      valid_to: new Date(data.endDate),
      is_active: true,
    },
    select: couponSelect,
  });
};

export const updateCoupon = async (
  couponId: string,
  data: Partial<{
    code: string;
    title: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrder: number;
    maxDiscount: number;
    usageLimit: number;
    startDate: string;
    endDate: string;
  }>
) => {
  const coupon = await prisma.coupons.findUnique({ where: { coupon_id: couponId } });
  if (!coupon) throw new Error('Coupon not found');

  if (data.code && data.code !== coupon.code) {
    const existing = await prisma.coupons.findUnique({ where: { code: data.code } });
    if (existing) throw new Error('Mã giảm giá đã tồn tại');
  }

  return prisma.coupons.update({
    where: { coupon_id: couponId },
    data: {
      code: data.code,
      description: data.title,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      min_purchase_amount: data.minOrder,
      max_discount_amount: data.maxDiscount,
      usage_limit: data.usageLimit,
      valid_from: data.startDate ? new Date(data.startDate) : undefined,
      valid_to: data.endDate ? new Date(data.endDate) : undefined,
    },
    select: couponSelect,
  });
};

export const deleteCoupon = async (couponId: string) => {
  const coupon = await prisma.coupons.findUnique({ where: { coupon_id: couponId } });
  if (!coupon) throw new Error('Coupon not found');

  await prisma.coupons.delete({ where: { coupon_id: couponId } });
  return { message: 'Coupon deleted successfully' };
};

export const toggleCouponStatus = async (couponId: string) => {
  const coupon = await prisma.coupons.findUnique({ where: { coupon_id: couponId } });
  if (!coupon) throw new Error('Coupon not found');

  return prisma.coupons.update({
    where: { coupon_id: couponId },
    data: { is_active: !coupon.is_active },
    select: couponSelect,
  });
};
