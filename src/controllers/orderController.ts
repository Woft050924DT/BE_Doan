import { Response } from 'express';
import { placeOrder as placeOrderService, getOrders as getOrdersService } from '../services/orderService';
import { AuthRequest } from '../middleware/auth';

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await placeOrderService(userId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Place order error:', error);
    if (error.message === 'Required fields are missing' || error.message === 'Cart is empty') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10 } = req.query;
    const result = await getOrdersService(userId, Number(page), Number(limit));
    res.json(result);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
