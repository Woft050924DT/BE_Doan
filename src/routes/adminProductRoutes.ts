import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  createVariant,
  updateVariant,
} from '../controllers/adminProductController';

const router = Router();

router.use(adminOnly);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/images', uploadProductImage);
router.delete('/products/:id/images/:imageId', deleteProductImage);
router.post('/products/:id/variants', createVariant);
router.put('/products/:id/variants/:variantId', updateVariant);
router.patch('/products/:id/variants/:variantId', updateVariant);

export default router;
