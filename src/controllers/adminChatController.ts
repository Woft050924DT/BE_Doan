import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getConversations as getConversationsService,
  getConversationDetail as getConversationDetailService,
  sendStaffMessage as sendStaffMessageService,
  updateConversation as updateConversationService,
  getStaffList as getStaffListService,
  getQuickReplies as getQuickRepliesService,
} from '../services/adminChatService';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getConversationsService(req.query);
    res.json(result);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversationDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getConversationDetailService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Get conversation detail error:', error);
    if (error.message === 'Conversation not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendStaffMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const result = await sendStaffMessageService(id as string, req.userId!, text);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Send staff message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await updateConversationService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStaffList = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await getStaffListService();
    res.json(result);
  } catch (error: any) {
    console.error('Get staff list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuickReplies = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await getQuickRepliesService();
    res.json(result);
  } catch (error: any) {
    console.error('Get quick replies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
