import { Request, Response } from 'express';
import {
  getProductList as getProductListService,
  getProductDetails as getProductDetailsService,
  getProductBySlug as getProductBySlugService,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from '../services/productService';
import { createReview as createReviewService } from '../services/reviewService';
import { AuthRequest } from '../middleware/auth';

export const getProductList = async (req: Request, res: Response) => {
  try {
    const result = await getProductListService(req.query);
    res.json(result);
  } catch (error: any) {
    console.error('Get product list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const result = await getProductBySlugService(req.params.slug as string);
    res.json(result);
  } catch (error: any) {
    console.error('Get product by slug error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
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

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createProductService(req.body, req.userId);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create product error:', error);
    if (
      error.message === 'Product name is required' ||
      error.message === 'SKU is required' ||
      error.message === 'Price must be a valid non-negative number' ||
      error.message === 'SKU already exists' ||
      error.message === 'Giá bán không được thấp hơn giá nhập'
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const result = await updateProductService(req.params.id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error.message === 'Product not found') return res.status(404).json({ error: error.message });
    if (error.message === 'SKU already exists') return res.status(400).json({ error: error.message });
    if (error.message === 'Giá bán không được thấp hơn giá nhập') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteProductService(req.params.id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete product error:', error);
    if (error.message === 'Product not found') return res.status(404).json({ error: error.message });
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Không thể xóa sản phẩm vì còn dữ liệu liên quan. Thử chuyển sang Ngừng bán.',
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createReviewService(req.userId!, req.params.id as string, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create review error:', error);
    if (error.message === 'Rating must be between 1 and 5') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
