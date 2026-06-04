import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from '../controllers/adminCouponController';

const router = Router();

router.use(adminOnly);
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.patch('/coupons/:id/toggle', toggleCouponStatus);

export default router;
