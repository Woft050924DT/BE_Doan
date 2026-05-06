import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { addToCart, getCart } from '../controllers/cartController';

const router = Router();

router.use(authenticate);
router.post('/', addToCart);
router.get('/', getCart);

export default router;
