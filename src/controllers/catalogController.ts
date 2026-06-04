import { Request, Response } from 'express';
import {
  getCategories as getCategoriesService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from '../services/categoryService';
import {
  getBrands as getBrandsService,
  createBrand as createBrandService,
  updateBrand as updateBrandService,
  deleteBrand as deleteBrandService,
} from '../services/brandService';
import { getBanners as getBannersService } from '../services/bannerService';
import { getMenus as getMenusService } from '../services/menuService';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const admin = req.query.admin === 'true';
    const categories = await getCategoriesService(admin);
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await createCategoryService(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.message?.includes('required') || error.message?.includes('already exists') || error.message?.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await updateCategoryService(req.params.id as string, req.body);
    res.json(category);
  } catch (error: any) {
    console.error('Update category error:', error);
    if (error.message === 'Category not found') return res.status(404).json({ error: error.message });
    if (error.message?.includes('already exists') || error.message?.includes('cannot') || error.message?.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const result = await deleteCategoryService(req.params.id as string);
    res.json({ success: true, category: result });
  } catch (error: any) {
    console.error('Delete category error:', error);
    if (error.message === 'Category not found') return res.status(404).json({ error: error.message });
    if (error.message?.includes('Cannot delete')) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  try {
    const admin = req.query.admin === 'true';
    const brands = await getBrandsService(admin);
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const brand = await createBrandService(req.body);
    res.status(201).json(brand);
  } catch (error: any) {
    console.error('Create brand error:', error);
    if (error.message?.includes('required') || error.message?.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const brand = await updateBrandService(req.params.id as string, req.body);
    res.json(brand);
  } catch (error: any) {
    console.error('Update brand error:', error);
    if (error.message === 'Brand not found') return res.status(404).json({ error: error.message });
    if (error.message?.includes('already exists')) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const result = await deleteBrandService(req.params.id as string);
    res.json({ success: true, brand: result });
  } catch (error: any) {
    console.error('Delete brand error:', error);
    if (error.message === 'Brand not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await getBannersService(req.query.position as string | undefined);
    res.json({ banners });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMenus = async (req: Request, res: Response) => {
  try {
    const menus = await getMenusService(req.query.location as string | undefined);
    res.json({ menus });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
