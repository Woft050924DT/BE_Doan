import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '../controllers/adminBannerController';

const router = Router();

router.use(adminOnly);
router.get('/banners', getAdminBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);
router.patch('/banners/:id/toggle', toggleBannerStatus);

export default router;
