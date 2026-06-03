import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getDashboardStats as getDashboardStatsService } from '../services/adminDashboardService';

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await getDashboardStatsService();
    res.json(result);
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
