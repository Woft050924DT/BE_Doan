import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  uploadProductImage as uploadProductImageService,
  deleteProductImage as deleteProductImageService,
  createVariant as createVariantService,
  updateVariant as updateVariantService,
} from '../services/adminProductService';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createProductService(req.body, req.userId!);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await updateProductService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteProductService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete product error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadProductImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { image_url, alt_text, display_order } = req.body;
    const result = await uploadProductImageService(id as string, image_url, alt_text, display_order);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Upload image error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProductImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id, imageId } = req.params;
    const result = await deleteProductImageService(id as string, imageId as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVariant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await createVariantService(id as string, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create variant error:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVariant = async (req: AuthRequest, res: Response) => {
  try {
    const { id, variantId } = req.params;
    const result = await updateVariantService(id as string, variantId as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update variant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
