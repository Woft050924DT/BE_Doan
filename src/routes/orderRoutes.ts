import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { placeOrder, getOrders, getOrderById, updateOrder } from '../controllers/orderController';

const router = Router();

router.use(authenticate);
router.post('/', placeOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id', updateOrder);

export default router;
