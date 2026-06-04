import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAILogs, exportAILogs } from '../services/adminAILogService';

export const getAdminAILogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, helpful, handed_off, low_confidence } = req.query;
    const result = await getAILogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      helpful: helpful !== undefined ? helpful === 'true' : undefined,
      handed_off: handed_off !== undefined ? handed_off === 'true' : undefined,
      low_confidence: low_confidence !== undefined ? low_confidence === 'true' : undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get AI logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportAdminAILogs = async (req: AuthRequest, res: Response) => {
  try {
    const result = await exportAILogs();
    res.json(result);
  } catch (error: any) {
    console.error('Export AI logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
