import { Response } from 'express';
import { getDashboardStats } from '../services/statsService';
import { AuthRequest, isAdminRole } from '../middleware/auth';

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminRole(req.userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
