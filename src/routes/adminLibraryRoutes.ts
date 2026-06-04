import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminMedia,
  updateMedia,
  deleteMedia,
} from '../controllers/adminLibraryController';

const router = Router();
router.use(adminOnly);

// /api/admin/library
router.get('/library', getAdminMedia);
router.put('/library/:id', updateMedia);
router.delete('/library/:id', deleteMedia);

// /api/admin/media (alias for frontend)
router.get('/media', getAdminMedia);
router.put('/media/:id', updateMedia);
router.delete('/media/:id', deleteMedia);

export default router;
