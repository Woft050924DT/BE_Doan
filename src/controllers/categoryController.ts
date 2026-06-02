import { Request, Response } from 'express';
import { getCategories as getCategoriesService } from '../services/categoryService';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getCategoriesService();
    res.json(categories);
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
