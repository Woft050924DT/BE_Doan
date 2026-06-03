import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendChatMessage as sendChatMessageService, getChatHistory as getChatHistoryService } from '../services/chatService';

export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, session_id, context } = req.body;
    const userId = req.userId || undefined;
    const result = await sendChatMessageService({ message, session_id, user_id: userId, context });
    res.json(result);
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { session_id, limit = 50 } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }
    const result = await getChatHistoryService(session_id as string, Number(limit));
    res.json(result);
  } catch (error: any) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
