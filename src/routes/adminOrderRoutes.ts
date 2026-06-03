import { Router } from 'express';
import { staffOnly } from '../middleware/auth';
import {
  getAdminOrders,
  updateAdminOrder,
  exportOrders,
  getOrderStatusOptions,
  trackOrder,
} from '../controllers/adminOrderController';

const router = Router();

router.use(staffOnly);

router.get('/orders', getAdminOrders);
router.patch('/orders/:orderId', updateAdminOrder);
router.get('/orders/export', exportOrders);
router.get('/orders/:orderId/track', trackOrder);

export default router;
