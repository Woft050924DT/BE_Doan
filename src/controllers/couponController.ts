import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  validateCoupon as validateCouponService,
  getUserCoupons as getUserCouponsService,
} from '../services/couponService';

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { coupon_code, cart_total } = req.body;
    const userId = req.userId!;
    const result = await validateCouponService(coupon_code, Number(cart_total) || 0, userId);
    res.json(result);
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getUserCouponsService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Get user coupons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
