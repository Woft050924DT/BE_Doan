import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  adjustStock,
  getInventoryList,
  getInventorySummary,
  getInventoryTransactions,
  receiveStock,
} from '../services/inventoryService';

export const getSummary = async (_req: AuthRequest, res: Response) => {
  try {
    const summary = await getInventorySummary();
    res.json(summary);
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getList = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getInventoryList(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    console.error('Get inventory list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getInventoryTransactions(req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) {
    console.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const postAdjust = async (req: AuthRequest, res: Response) => {
  try {
    const result = await adjustStock(req.userId!, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Adjust stock error:', error);
    if (
      error.message === 'Variant not found' ||
      error.message === 'Insufficient stock' ||
      error.message.includes('required') ||
      error.message.includes('Quantity') ||
      error.message.includes('negative')
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const postReceive = async (req: AuthRequest, res: Response) => {
  try {
    const result = await receiveStock(req.userId!, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Receive stock error:', error);
    if (
      error.message === 'Variant not found' ||
      error.message === 'SKU already exists' ||
      error.message === 'Product name is required' ||
      error.message.includes('required') ||
      error.message.includes('Quantity') ||
      error.message.includes('Giá nhập') ||
      error.message.includes('Giá bán') ||
      error.message.includes('Chọn sản phẩm') ||
      error.message.includes('Giá bán phải')
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
