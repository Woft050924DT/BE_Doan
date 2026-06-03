import { Router } from 'express';
import { staffOnly } from '../middleware/auth';
import { getStaffList, getQuickReplies } from '../controllers/adminChatController';

const router = Router();

router.use(staffOnly);
router.get('/staff', getStaffList);
router.get('/quick-replies', getQuickReplies);

export default router;
