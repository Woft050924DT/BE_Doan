import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateCoupon, getUserCoupons } from '../controllers/couponController';

const router = Router();

router.post('/validate', authenticate, validateCoupon);
router.get('/', authenticate, getUserCoupons);

export default router;
