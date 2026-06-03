import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getProfileStats as getProfileStatsService,
  changePassword as changePasswordService,
} from '../services/profileStatsService';

export const getProfileStats = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getProfileStatsService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    const result = await changePasswordService(req.userId!, current_password, new_password);
    res.json(result);
  } catch (error: any) {
    console.error('Change password error:', error);
    if (error.message === 'Current password is incorrect' ||
        error.message === 'New password must be at least 8 characters') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Profile not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
