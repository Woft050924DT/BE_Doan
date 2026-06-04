import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminBrands as getAdminBrandsService,
  getBrandById as getBrandByIdService,
  createBrand as createBrandService,
  updateBrand as updateBrandService,
  deleteBrand as deleteBrandService,
  toggleFeatured as toggleFeaturedService,
} from '../services/adminBrandService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminBrands = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await getAdminBrandsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBrandById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid brand ID format' });
    const result = await getBrandByIdService(id);
    res.json(result);
  } catch (error: any) {
    console.error('Get brand error:', error);
    if (error.message === 'Brand not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const result = await createBrandService({ name: name.trim(), ...req.body });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create brand error:', error);
    if (error.message.includes('Unique constraint')) {
      return res.status(400).json({ error: 'Brand with this name or slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid brand ID format' });
    const result = await updateBrandService(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update brand error:', error);
    if (error.message === 'Brand not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid brand ID format' });
    const result = await deleteBrandService(id);
    res.json(result);
  } catch (error: any) {
    console.error('Delete brand error:', error);
    if (error.message === 'Brand not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid brand ID format' });
    const result = await toggleFeaturedService(id);
    res.json(result);
  } catch (error: any) {
    console.error('Toggle featured error:', error);
    if (error.message === 'Brand not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
