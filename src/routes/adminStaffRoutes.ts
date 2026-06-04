import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminStaff,
  updateStaffStatus,
  updateStaffRole,
  updateStaff,
} from '../controllers/adminStaffController';

const router = Router();
router.use(adminOnly);

router.get('/staff', getAdminStaff);
router.put('/staff/:id', updateStaff);
router.patch('/staff/:id/status', updateStaffStatus);
router.patch('/staff/:id/role', updateStaffRole);

export default router;
