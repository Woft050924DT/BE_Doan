import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import { sendChatMessage, getChatHistory } from '../controllers/chatController';

const router = Router();

router.post('/', optionalAuth, sendChatMessage);
router.get('/history', optionalAuth, getChatHistory);

export default router;
