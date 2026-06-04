import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminCustomers as getAdminCustomersService,
  getAdminCustomerById as getAdminCustomerByIdService,
  updateCustomerStatus as updateCustomerStatusService,
} from '../services/adminCustomerService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, status, is_active, role } = req.query;
    const result = await getAdminCustomersService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      role: role as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }
    const result = await getAdminCustomerByIdService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Get admin customer by id error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid customer ID format' });
    }
    const { status } = req.body;
    if (!status || !['active', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or banned' });
    }
    const result = await updateCustomerStatusService(id as string, status);
    res.json(result);
  } catch (error: any) {
    console.error('Update customer status error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
