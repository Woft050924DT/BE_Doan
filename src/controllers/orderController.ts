import { Response } from 'express';
import {
  placeOrder as placeOrderService,
  getOrders as getOrdersService,
  getOrderById as getOrderByIdService,
  updateOrder as updateOrderService,
} from '../services/orderService';
import { AuthRequest, isAdminRole } from '../middleware/auth';

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await placeOrderService(userId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Place order error:', error);
    if (
      error.message === 'Required fields are missing' ||
      error.message === 'Cart is empty' ||
      error.message === 'Insufficient stock'
    ) {
      return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
    }
    if (error.message === 'Variant is required for this product') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 10 } = req.query;
    const admin = isAdminRole(req.userRole);
    const result = await getOrdersService(userId, Number(page), Number(limit), admin);
    res.json(result);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const admin = isAdminRole(req.userRole);
    const result = await getOrderByIdService(userId, req.params.id as string, admin);
    res.json(result);
  } catch (error: any) {
    console.error('Get order error:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminRole(req.userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const userId = req.userId!;
    const result = await updateOrderService(userId, req.params.id as string, req.body, true);
    res.json(result);
  } catch (error: any) {
    console.error('Update order error:', error);
    if (error.message === 'Order not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Invalid order status') return res.status(400).json({ error: 'Trạng thái đơn không hợp lệ' });
    if (error.message?.includes('Insufficient stock')) {
      return res.status(400).json({ error: 'Không đủ tồn kho để giao hàng' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
