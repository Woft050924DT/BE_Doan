import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminPayments,
  refundPayment,
  updatePaymentStatus,
} from '../controllers/adminPaymentController';

const router = Router();
router.use(adminOnly);

router.get('/payments', getAdminPayments);
router.patch('/payments/:id/refund', refundPayment);
router.patch('/payments/:id/status', updatePaymentStatus);

export default router;
