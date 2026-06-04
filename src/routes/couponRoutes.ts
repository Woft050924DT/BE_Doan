import { Router } from 'express';
import { optionalAuthenticate } from '../middleware/auth';
import { validateCoupon } from '../controllers/couponController';

const router = Router();

router.post('/validate', optionalAuthenticate, validateCoupon);

export default router;
