import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { placeOrder, getOrders } from '../controllers/orderController';

const router = Router();

router.use(authenticate);
router.post('/', placeOrder);
router.get('/', getOrders);

export default router;
