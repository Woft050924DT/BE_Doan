import { Response } from 'express';
import {
  getAddresses as getAddressesService,
  createAddress as createAddressService,
  updateAddress as updateAddressService,
  deleteAddress as deleteAddressService,
} from '../services/addressService';
import { AuthRequest } from '../middleware/auth';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await getAddressesService(req.userId!);
    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await createAddressService(req.userId!, req.body);
    res.status(201).json(address);
  } catch (error: any) {
    console.error('Create address error:', error);
    if (error.message === 'Required address fields are missing') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const address = await updateAddressService(req.userId!, req.params.id as string, req.body);
    res.json(address);
  } catch (error: any) {
    console.error('Update address error:', error);
    if (error.message === 'Address not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteAddressService(req.userId!, req.params.id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete address error:', error);
    if (error.message === 'Address not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
