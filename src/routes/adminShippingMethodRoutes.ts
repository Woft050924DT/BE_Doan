import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminShippingMethods,
  updateAdminShippingMethod,
  updateAdminShippingSettings,
} from '../controllers/adminShippingMethodController';

const router = Router();
router.use(adminOnly);

router.get('/shipping-methods', getAdminShippingMethods);
router.put('/shipping-methods/:id', updateAdminShippingMethod);
router.put('/shipping-methods/settings', updateAdminShippingSettings);

export default router;
