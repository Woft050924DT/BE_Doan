import { Response } from 'express';
import { validateCoupon as validateCouponService } from '../services/couponService';
import { AuthRequest } from '../middleware/auth';

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    const result = await validateCouponService(
      code,
      Number(subtotal) || 0,
      req.userId
    );
    res.json(result);
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    if (
      error.message === 'Coupon code is required' ||
      error.message === 'Invalid coupon code' ||
      error.message === 'Coupon is expired or not yet valid' ||
      error.message === 'Coupon usage limit reached' ||
      error.message === 'Order does not meet minimum purchase for this coupon' ||
      error.message === 'Coupon usage limit per user reached'
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
