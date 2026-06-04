import { Response } from 'express';
import {
  addToCart as addToCartService,
  getCart as getCartService,
  updateCartItem as updateCartItemService,
  removeCartItem as removeCartItemService,
} from '../services/cartService';
import { AuthRequest } from '../middleware/auth';

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { product_id, variant_id, quantity } = req.body;
    const result = await addToCartService(userId, product_id, variant_id || null, quantity);
    res.json(result);
  } catch (error: any) {
    console.error('Add to cart error:', error);
    if (
      error.message === 'Product ID and quantity are required' ||
      error.message === 'Variant is required for this product' ||
      error.message === 'Insufficient stock'
    ) {
      return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
    }
    if (error.message === 'Product not found' || error.message === 'Variant not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await getCartService(userId);
    res.json(result);
  } catch (error: any) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { itemId } = req.params;
    const { quantity } = req.body;
    const result = await updateCartItemService(userId, itemId as string, quantity);
    res.json(result);
  } catch (error: any) {
    console.error('Update cart item error:', error);
    if (error.message === 'Quantity must be at least 1') {
      return res.status(400).json({ error: 'Số lượng phải ít nhất là 1' });
    }
    if (error.message === 'Insufficient stock') {
      return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
    }
    if (error.message === 'Cart item not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { itemId } = req.params;
    const result = await removeCartItemService(userId, itemId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Remove cart item error:', error);
    if (error.message === 'Cart item not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
