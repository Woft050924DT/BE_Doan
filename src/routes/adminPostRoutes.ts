import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/adminPostController';

const router = Router();
router.use(adminOnly);

router.get('/posts', getAdminPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

export default router;
