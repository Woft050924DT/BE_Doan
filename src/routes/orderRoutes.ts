import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  buyNow,
  checkoutOptions,
  getOrders,
  getOrderById,
  cancelOrder,
  paymentMethods,
  placeOrder,
  shippingMethods,
} from '../controllers/orderController';

const router = Router();

router.use(authenticate);
router.get('/checkout-options', checkoutOptions);
router.get('/shipping-methods', shippingMethods);
router.get('/payment-methods', paymentMethods);
router.post('/buy-now', buyNow);
router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/cancel', cancelOrder);

export default router;
