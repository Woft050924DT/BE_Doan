import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminQuickReplies as getAdminQuickRepliesService,
  createQuickReply as createQuickReplyService,
  updateQuickReply as updateQuickReplyService,
  deleteQuickReply as deleteQuickReplyService,
} from '../services/adminQuickReplyService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminQuickReplies = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await getAdminQuickRepliesService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin quick replies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createQuickReply = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const result = await createQuickReplyService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create quick reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateQuickReply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid quick reply ID format' });
    const result = await updateQuickReplyService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update quick reply error:', error);
    if (error.message === 'Quick reply not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteQuickReply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid quick reply ID format' });
    const result = await deleteQuickReplyService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete quick reply error:', error);
    if (error.message === 'Quick reply not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
