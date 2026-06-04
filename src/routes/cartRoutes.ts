import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cartController';

const router = Router();

router.use(authenticate);
router.post('/', addToCart);
router.get('/', getCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);

export default router;
