import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminCoupons as getAdminCouponsService,
  createCoupon as createCouponService,
  updateCoupon as updateCouponService,
  deleteCoupon as deleteCouponService,
  toggleCouponStatus as toggleCouponStatusService,
} from '../services/adminCouponService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, status, is_active } = req.query;
    const result = await getAdminCouponsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin coupons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createCouponService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create coupon error:', error);
    if (error.message === 'Mã giảm giá đã tồn tại') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid coupon ID format' });
    }
    const result = await updateCouponService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update coupon error:', error);
    if (error.message === 'Coupon not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Mã giảm giá đã tồn tại') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid coupon ID format' });
    }
    const result = await deleteCouponService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    if (error.message === 'Coupon not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleCouponStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid coupon ID format' });
    }
    const result = await toggleCouponStatusService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Toggle coupon status error:', error);
    if (error.message === 'Coupon not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
