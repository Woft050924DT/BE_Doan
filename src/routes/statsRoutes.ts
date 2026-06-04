import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAdminDashboard } from '../controllers/statsController';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getAdminDashboard);

export default router;
