import { Request, Response } from 'express';
import { getProductList as getProductListService, getProductDetails as getProductDetailsService } from '../services/productService';

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
