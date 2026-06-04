import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleFeatured,
} from '../controllers/adminBrandController';

const router = Router();
router.use(adminOnly);

router.get('/brands', getAdminBrands);
router.get('/brands/:id', getBrandById);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);
router.patch('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);
router.patch('/brands/:id/toggle-featured', toggleFeatured);

export default router;
