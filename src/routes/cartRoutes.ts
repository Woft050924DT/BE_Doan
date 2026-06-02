import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController';

const router = Router();

router.use(authenticate);
router.post('/', addToCart);
router.get('/', getCart);
router.put('/:cartItemId', updateCartItem);
router.delete('/:cartItemId', removeCartItem);
router.delete('/', clearCart);

export default router;
