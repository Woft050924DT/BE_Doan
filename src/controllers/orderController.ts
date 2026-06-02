import { Response } from 'express';
import {
  buyNow as buyNowService,
  getCheckoutOptions,
  getOrders as getOrdersService,
  getOrderById as getOrderByIdService,
  cancelOrder as cancelOrderService,
  getPaymentMethods,
  getShippingMethods,
  placeOrder as placeOrderService,
} from '../services/orderService';
import { AuthRequest } from '../middleware/auth';

const badRequestErrors = [
  'Required fields are missing',
  'Cart is empty',
  'Order items are required',
  'Product ID and quantity are required',
];

const notFoundErrors = ['Product not found', 'Variant not found'];

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await placeOrderService(userId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Place order error:', error);
    if (badRequestErrors.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    if (notFoundErrors.includes(error.message)) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const buyNow = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await buyNowService(userId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Buy now error:', error);
    if (badRequestErrors.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    if (notFoundErrors.includes(error.message)) {
      return res.status(404).json({ error: error.message });
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

export const checkoutOptions = (_req: AuthRequest, res: Response) => {
  res.json(getCheckoutOptions());
};

export const shippingMethods = (_req: AuthRequest, res: Response) => {
  res.json({ shipping_methods: getShippingMethods() });
};

export const paymentMethods = (_req: AuthRequest, res: Response) => {
  res.json({ payment_methods: getPaymentMethods() });
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { orderId } = req.params;
    const result = await getOrderByIdService(userId, orderId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Get order by ID error:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { orderId } = req.params;
    const { reason } = req.body;
    const result = await cancelOrderService(userId, orderId as string, reason);
    res.json(result);
  } catch (error: any) {
    console.error('Cancel order error:', error);
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Order cannot be cancelled') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
