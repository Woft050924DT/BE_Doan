import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminStaff as getAdminStaffService,
  updateStaffStatus as updateStaffStatusService,
  updateStaffRole as updateStaffRoleService,
  updateStaff as updateStaffService,
} from '../services/adminStaffService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const normalizeUUID = (id: string): string => {
  const cleaned = id.replace(/-/g, '');
  if (cleaned.length === 32 && /^[0-9a-f]{32}$/i.test(cleaned)) {
    return `${cleaned.slice(0,8)}-${cleaned.slice(8,12)}-${cleaned.slice(12,16)}-${cleaned.slice(16,20)}-${cleaned.slice(20)}`;
  }
  return id;
};

export const getAdminStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await getAdminStaffService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      role: role as string | undefined,
      status: status as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStaffStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = normalizeUUID(req.params.id as string);
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid staff ID format' });
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const result = await updateStaffStatusService(id, status);
    res.json(result);
  } catch (error: any) {
    console.error('Update staff status error:', error);
    if (error.message === 'Staff not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStaffRole = async (req: AuthRequest, res: Response) => {
  try {
    const id = normalizeUUID(req.params.id as string);
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid staff ID format' });
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const result = await updateStaffRoleService(id, role);
    res.json(result);
  } catch (error: any) {
    console.error('Update staff role error:', error);
    if (error.message === 'Staff not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const id = normalizeUUID(req.params.id as string);
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid staff ID format' });
    const { status, role } = req.body;
    if (!status && !role) {
      return res.status(400).json({ error: 'At least one of status or role is required' });
    }
    const result = await updateStaffService(id, { status, role });
    res.json(result);
  } catch (error: any) {
    console.error('Update staff error:', error);
    if (error.message === 'Staff not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
