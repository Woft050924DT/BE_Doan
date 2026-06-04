import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminPaymentMethods,
  updateAdminPaymentMethod,
  updateAdminPaymentSettings,
} from '../controllers/adminPaymentMethodController';

const router = Router();
router.use(adminOnly);

router.get('/payment-methods', getAdminPaymentMethods);
router.put('/payment-methods/:id', updateAdminPaymentMethod);
router.put('/payment-methods/settings', updateAdminPaymentSettings);

export default router;
