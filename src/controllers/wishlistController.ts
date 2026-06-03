import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getWishlist as getWishlistService,
  addToWishlist as addToWishlistService,
  removeFromWishlist as removeFromWishlistService,
} from '../services/wishlistService';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getWishlistService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, variant_id } = req.body;
    const result = await addToWishlistService(req.userId!, product_id, variant_id);
    res.json(result);
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await removeFromWishlistService(req.userId!, productId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
