import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import { getAdminAILogs, exportAdminAILogs } from '../controllers/adminAILogController';

const router = Router();
router.use(adminOnly);

router.get('/ai-logs', getAdminAILogs);
router.get('/ai-logs/export', exportAdminAILogs);

export default router;
