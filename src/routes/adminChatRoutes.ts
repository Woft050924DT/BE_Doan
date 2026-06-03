import { Router } from 'express';
import { staffOnly } from '../middleware/auth';
import {
  getConversations,
  getConversationDetail,
  sendStaffMessage,
  updateConversation,
} from '../controllers/adminChatController';

const router = Router();

router.use(staffOnly);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationDetail);
router.post('/conversations/:id/messages', sendStaffMessage);
router.patch('/conversations/:id', updateConversation);

export default router;
