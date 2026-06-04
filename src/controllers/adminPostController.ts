import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getAdminPosts as getAdminPostsService,
  getPostById as getPostByIdService,
  createPost as createPostService,
  updatePost as updatePostService,
  deletePost as deletePostService,
} from '../services/adminPostService';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const normalizeUUID = (id: string): string => {
  const cleaned = id.replace(/-/g, '');
  if (cleaned.length === 32 && /^[0-9a-f]{32}$/i.test(cleaned)) {
    return `${cleaned.slice(0,8)}-${cleaned.slice(8,12)}-${cleaned.slice(12,16)}-${cleaned.slice(16,20)}-${cleaned.slice(20)}`;
  }
  return id;
};

export const getAdminPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await getAdminPostsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
      status: status as string | undefined,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Get admin posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const id = normalizeUUID(req.params.id as string);
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid post ID format' });
    const result = await getPostByIdService(id);
    res.json(result);
  } catch (error: any) {
    console.error('Get post error:', error);
    if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await createPostService({ title: title.trim(), ...req.body });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = normalizeUUID(req.params.id as string);
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid post ID format' });
    const result = await updatePostService(id, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Update post error:', error);
    if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = normalizeUUID(req.params.id as string);
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid post ID format' });
    const result = await deletePostService(id);
    res.json(result);
  } catch (error: any) {
    console.error('Delete post error:', error);
    if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};
