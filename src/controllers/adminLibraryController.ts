import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminMedia as getAdminMediaService,
  deleteMedia as deleteMediaService,
  updateMedia as updateMediaService,
} from '../services/adminLibraryService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, file_type, type } = req.query;
    const result = await getAdminMediaService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      file_type: (file_type || type) as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid media ID format' });
    const result = await updateMediaService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update media error:', error);
    if (error.message === 'Media not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid media ID format' });
    const result = await deleteMediaService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete media error:', error);
    if (error.message === 'Media not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
