import { Request, Response } from 'express';
import { login as loginService } from '../services/authService';

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
