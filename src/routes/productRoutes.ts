import { Router } from 'express';
import { getProductList, getProductDetails } from '../controllers/productController';

const router = Router();

router.get('/', getProductList);
router.get('/:id', getProductDetails);

export default router;
