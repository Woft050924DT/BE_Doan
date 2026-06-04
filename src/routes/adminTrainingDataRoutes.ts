import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminTrainingData,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
} from '../controllers/adminTrainingDataController';

const router = Router();
router.use(adminOnly);

router.get('/training-data', getAdminTrainingData);
router.post('/training-data', createTrainingData);
router.put('/training-data/:id', updateTrainingData);
router.delete('/training-data/:id', deleteTrainingData);

export default router;
