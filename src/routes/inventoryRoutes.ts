import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getSummary,
  getList,
  getTransactions,
  postAdjust,
  postReceive,
} from '../controllers/inventoryController';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/summary', getSummary);
router.get('/transactions', getTransactions);
router.get('/', getList);
router.post('/adjust', postAdjust);
router.post('/receive', postReceive);

export default router;
