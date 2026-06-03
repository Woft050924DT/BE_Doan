import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import { getDashboardStats } from '../controllers/adminDashboardController';

const router = Router();

router.use(adminOnly);
router.get('/dashboard', getDashboardStats);

export default router;
