import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminSettings,
  updateSetting,
  upsertSetting,
} from '../controllers/adminSettingsController';

const router = Router();
router.use(adminOnly);

router.get('/settings', getAdminSettings);
router.put('/settings', updateSetting);
router.post('/settings', upsertSetting);

export default router;
