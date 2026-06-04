import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getPaymentMethods, updatePaymentMethod, updatePaymentSettings } from '../services/adminPaymentMethodService';

export const getAdminPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getPaymentMethods();
    res.json(result);
  } catch (error: any) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminPaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await updatePaymentMethod(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminPaymentSettings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await updatePaymentSettings(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
