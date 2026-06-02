import { Response } from 'express';
import { addToCart as addToCartService, getCart as getCartService } from '../services/cartService';
import { AuthRequest } from '../middleware/auth';

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const product_id = req.body.product_id || req.body.productId;
    const variant_id = req.body.variant_id || req.body.variantId;
    const quantity = req.body.quantity ?? 1;
    const result = await addToCartService(userId, product_id, variant_id || null, quantity);
    res.json(result);
  } catch (error: any) {
    console.error('Add to cart error:', error);
    if (error.message === 'Product ID and quantity are required') {
      return res.status(400).json({ error: error.message });
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
