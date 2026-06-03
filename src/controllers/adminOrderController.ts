import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminOrders as getAdminOrdersService,
  updateAdminOrder as updateAdminOrderService,
  exportOrders as exportOrdersService,
  getOrderStatusOptions as getOrderStatusOptionsService,
  trackOrder as trackOrderService,
} from '../services/adminOrderService';

export const getAdminOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAdminOrdersService(req.query);
    res.json(result);
  } catch (error: any) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await updateAdminOrderService(orderId as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update admin order error:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await exportOrdersService(req.query);
    res.json(result);
  } catch (error: any) {
    console.error('Export orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderStatusOptions = async (_req: AuthRequest, res: Response) => {
  res.json(getOrderStatusOptionsService());
};

export const trackOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await trackOrderService(orderId as string, req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Track order error:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
