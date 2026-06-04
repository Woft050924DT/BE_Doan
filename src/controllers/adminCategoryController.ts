import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminCategories as getAdminCategoriesService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from '../services/adminCategoryService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getAdminCategoriesService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parent_id, description, image_url, icon, sort_order, is_active, meta_title, meta_description, meta_keywords } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const result = await createCategoryService({
      name: name.trim(),
      parent_id,
      description,
      image_url,
      icon,
      sort_order,
      is_active,
      meta_title,
      meta_description,
      meta_keywords,
    });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid category ID format' });
    }
    const result = await updateCategoryService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update category error:', error);
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid category ID format' });
    }
    const result = await deleteCategoryService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete category error:', error);
    if (error.message === 'Category not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
