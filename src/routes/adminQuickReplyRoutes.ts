import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminQuickReplies,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
} from '../controllers/adminQuickReplyController';

const router = Router();
router.use(adminOnly);

router.get('/quick-replies', getAdminQuickReplies);
router.post('/quick-replies', createQuickReply);
router.put('/quick-replies/:id', updateQuickReply);
router.delete('/quick-replies/:id', deleteQuickReply);

export default router;
