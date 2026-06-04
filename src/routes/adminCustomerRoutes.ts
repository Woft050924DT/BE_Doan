import { Router } from 'express';
import { adminOnly } from '../middleware/auth';
import {
  getAdminCustomers,
  getAdminCustomerById,
  updateCustomerStatus,
} from '../controllers/adminCustomerController';

const router = Router();

router.use(adminOnly);
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerById);
router.patch('/customers/:id', updateCustomerStatus);

export default router;
