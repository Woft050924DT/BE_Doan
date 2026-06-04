import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminBanners as getAdminBannersService,
  createBanner as createBannerService,
  updateBanner as updateBannerService,
  deleteBanner as deleteBannerService,
  toggleBannerStatus as toggleBannerStatusService,
} from '../services/adminBannerService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminBanners = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, status, position } = req.query;
    const result = await getAdminBannersService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
      position: position as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin banners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBanner = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createBannerService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create banner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid banner ID format' });
    }
    const result = await updateBannerService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update banner error:', error);
    if (error.message === 'Banner not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid banner ID format' });
    }
    const result = await deleteBannerService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete banner error:', error);
    if (error.message === 'Banner not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleBannerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid banner ID format' });
    }
    const result = await toggleBannerStatusService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Toggle banner status error:', error);
    if (error.message === 'Banner not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
