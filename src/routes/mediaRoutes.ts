import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getMediaFiles } from '../controllers/mediaController';

const router = Router();

router.get('/files', authenticate, requireAdmin, getMediaFiles);

export default router;
