import { Request, Response } from 'express';
import { login as loginService, register as registerService } from '../services/authService';

export const login = async (req: Request, res: Response) => {
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

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, avatar_url } = req.body;
    const result = await registerService({ email, password, full_name, phone, avatar_url });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.message === 'Email and password are required' ||
        error.message === 'Password must be at least 8 characters') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
