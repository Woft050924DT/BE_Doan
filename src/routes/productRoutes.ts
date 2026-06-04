import { Router } from 'express';
import {
  getProductList,
  getProductDetails,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} from '../controllers/productController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getProductList);
router.post('/', authenticate, requireAdmin, createProduct);
router.get('/slug/:slug', getProductBySlug);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);
router.post('/:id/reviews', authenticate, createReview);
router.get('/:id', getProductDetails);

export default router;
