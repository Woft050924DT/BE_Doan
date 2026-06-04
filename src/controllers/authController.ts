import { Response } from 'express';
import {
  login as loginService,
  register as registerService,
  getMe as getMeService,
} from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, full_name, phone } = req.body;
    const result = await registerService(email, password, full_name, phone);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Register error:', error);
    if (
      error.message === 'Email, password and full name are required' ||
      error.message === 'Password must be at least 6 characters'
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.message === 'Email and password are required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getMeService(req.userId!);
    res.json({ user: result });
  } catch (error: any) {
    console.error('Get me error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
