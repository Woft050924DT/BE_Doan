import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminReviews as getAdminReviewsService,
  approveReview as approveReviewService,
  rejectReview as rejectReviewService,
  deleteReview as deleteReviewService,
} from '../services/adminReviewService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, approved } = req.query;
    const result = await getAdminReviewsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      approved: approved === 'true' ? true : approved === 'false' ? false : undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }
    const result = await approveReviewService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Approve review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }
    const result = await rejectReviewService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Reject review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }
    const result = await deleteReviewService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
