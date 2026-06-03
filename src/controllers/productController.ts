import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getProductList as getProductListService,
  getProductDetails as getProductDetailsService,
  getBrands as getBrandsService,
  getProductReviews as getProductReviewsService,
  addProductReview as addProductReviewService,
  markReviewHelpful as markReviewHelpfulService,
} from '../services/productService';

export const getProductList = async (req: Request, res: Response) => {
  try {
    const result = await getProductListService(req.query);
    res.json(result);
  } catch (error: any) {
    console.error('Get product list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getProductDetailsService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Get product details error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBrands = async (_req: Request, res: Response) => {
  try {
    const result = await getBrandsService();
    res.json(result);
  } catch (error: any) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getProductReviewsService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Get product reviews error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images, order_id } = req.body;
    const userId = req.userId!;
    const result = await addProductReviewService(id as string, userId, { rating, title, comment, images, order_id });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Add product review error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markReviewHelpful = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const result = await markReviewHelpfulService(reviewId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
