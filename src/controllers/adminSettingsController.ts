import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminSettings as getAdminSettingsService,
  updateSetting as updateSettingService,
  upsertSetting as upsertSettingService,
} from '../services/adminSettingsService';

export const getAdminSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await getAdminSettingsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { category, key, ...data } = req.body;
    if (!category || !key) {
      return res.status(400).json({ error: 'Category and key are required' });
    }
    const result = await updateSettingService(key, category, data);
    res.json(result);
  } catch (error: any) {
    console.error('Update setting error:', error);
    if (error.message === 'Setting not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { category, key } = req.body;
    if (!category || !key) {
      return res.status(400).json({ error: 'Category and key are required' });
    }
    const result = await upsertSettingService(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Upsert setting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
