import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminTrainingData as getAdminTrainingDataService,
  createTrainingData as createTrainingDataService,
  updateTrainingData as updateTrainingDataService,
  deleteTrainingData as deleteTrainingDataService,
} from '../services/adminTrainingDataService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAdminTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await getAdminTrainingDataService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin training data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const { category, question, answer } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({ error: 'Category, question and answer are required' });
    }
    const result = await createTrainingDataService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create training data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid training ID format' });
    const result = await updateTrainingDataService(id as string, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update training data error:', error);
    if (error.message === 'Training data not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id as string)) return res.status(400).json({ error: 'Invalid training ID format' });
    const result = await deleteTrainingDataService(id as string);
    res.json(result);
  } catch (error: any) {
    console.error('Delete training data error:', error);
    if (error.message === 'Training data not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
