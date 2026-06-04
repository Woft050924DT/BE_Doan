import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAITrainingData as getAITrainingDataService,
  createQARecord as createQARecordService,
  updateQARecord as updateQARecordService,
  deleteQARecord as deleteQARecordService,
  importQARecords as importQARecordsService,
  exportQARecords as exportQARecordsService,
  getAIMetrics as getAIMetricsService,
} from '../services/adminAIService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const getAITrainingData = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAITrainingDataService(req.query);
    res.json(result);
  } catch (error: any) {
    console.error('Get AI training data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createQARecord = async (req: AuthRequest, res: Response) => {
  try {
    const result = await createQARecordService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create QA record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateQARecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid ID format' });
    const result = await updateQARecordService(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update QA record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteQARecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid ID format' });
    const result = await deleteQARecordService(id);
    res.json(result);
  } catch (error: any) {
    console.error('Delete QA record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const importQARecords = async (req: AuthRequest, res: Response) => {
  try {
    const records = req.body.records || [];
    const result = await importQARecordsService(records);
    res.json(result);
  } catch (error: any) {
    console.error('Import QA records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportQARecords = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await exportQARecordsService();
    res.json(result);
  } catch (error: any) {
    console.error('Export QA records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAIMetrics = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await getAIMetricsService();
    res.json(result);
  } catch (error: any) {
    console.error('Get AI metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
