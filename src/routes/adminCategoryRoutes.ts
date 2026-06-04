import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminCategoryController';

const router = Router();

router.use(adminOnly);

router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
