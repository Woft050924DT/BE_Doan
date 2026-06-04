import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getShippingMethods, updateShippingMethod, updateShippingSettings } from '../services/adminShippingMethodService';

export const getAdminShippingMethods = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getShippingMethods();
    res.json(result);
  } catch (error: any) {
    console.error('Get shipping methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminShippingMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const result = await updateShippingMethod(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update shipping method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminShippingSettings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await updateShippingSettings(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update shipping settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
