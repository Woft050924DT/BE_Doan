import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAITrainingData,
  createQARecord,
  updateQARecord,
  deleteQARecord,
  importQARecords,
  exportQARecords,
  getAIMetrics,
} from '../controllers/adminAIController';

const router = Router();

router.use(adminOnly);
router.get('/ai-training', getAITrainingData);
router.post('/ai-training', createQARecord);
router.put('/ai-training/:id', updateQARecord);
router.delete('/ai-training/:id', deleteQARecord);
router.post('/ai-training/import', importQARecords);
router.get('/ai-training/export', exportQARecords);
router.get('/ai-training/metrics', getAIMetrics);

export default router;
