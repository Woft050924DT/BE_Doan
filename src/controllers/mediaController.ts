import { Response } from 'express';
import { listMediaFiles } from '../services/mediaService';
import { AuthRequest } from '../middleware/auth';

export const getMediaFiles = async (_req: AuthRequest, res: Response) => {
  try {
    const files = listMediaFiles();
    res.json({ files });
  } catch (error) {
    console.error('List media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
