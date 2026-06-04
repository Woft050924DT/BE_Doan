import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBanners,
  getMenus,
} from '../controllers/catalogController';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', authenticate, requireAdmin, createCategory);
router.put('/categories/:id', authenticate, requireAdmin, updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, deleteCategory);

router.get('/brands', getBrands);
router.post('/brands', authenticate, requireAdmin, createBrand);
router.put('/brands/:id', authenticate, requireAdmin, updateBrand);
router.delete('/brands/:id', authenticate, requireAdmin, deleteBrand);

router.get('/banners', getBanners);
router.get('/menus', getMenus);

export default router;
