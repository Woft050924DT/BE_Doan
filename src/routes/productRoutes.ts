import { Router } from 'express';
import { getProductList, getProductDetails, getBrands, getProductReviews, addProductReview, markReviewHelpful } from '../controllers/productController';

const router = Router();

router.get('/', getProductList);
router.get('/brands', getBrands);
router.get('/:id', getProductDetails);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', addProductReview);
router.post('/:id/reviews/:reviewId/helpful', markReviewHelpful);

export default router;
