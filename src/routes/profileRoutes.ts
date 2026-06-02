import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createAddress,
  createProfile,
  deleteAddress,
  deleteProfile,
  getAddress,
  getAddresses,
  getProfile,
  updateAddress,
  updateProfile,
} from '../controllers/profileController';

const router = Router();

router.post('/', createProfile);

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.patch('/', updateProfile);
router.delete('/', deleteProfile);

router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.get('/addresses/:addressId', getAddress);
router.put('/addresses/:addressId', updateAddress);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;
