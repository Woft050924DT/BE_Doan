import { Router } from 'express';
import { staffOnly } from '../middleware/auth';
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from '../controllers/adminReviewController';

const router = Router();

router.use(staffOnly);
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/approve', approveReview);
router.patch('/reviews/:id/reject', rejectReview);
router.delete('/reviews/:id', deleteReview);

export default router;
