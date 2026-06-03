import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getNotifications as getNotificationsService,
  getUnreadCount as getUnreadCountService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
} from '../services/notificationService';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getNotificationsService(req.userId!, Number(page), Number(limit));
    res.json(result);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getUnreadCountService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await markAsReadService(id as string, req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Mark as read error:', error);
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await markAllAsReadService(req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
