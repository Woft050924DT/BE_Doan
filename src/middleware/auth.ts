import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const decodeToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
};

const loadUserRole = async (userId: string): Promise<string | null> => {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: { role: true, status: true },
  });
  if (!user || user.status !== 'active') return null;
  return user.role;
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = decodeToken(token);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    if (!req.userRole) {
      const role = await loadUserRole(decoded.userId);
      if (!role) {
        return res.status(401).json({ error: 'Invalid or inactive user' });
      }
      req.userRole = role;
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = decodeToken(token);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    if (!req.userRole) {
      req.userRole = (await loadUserRole(decoded.userId)) ?? undefined;
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const isAdminRole = (role?: string) => role === 'admin' || role === 'staff';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!isAdminRole(req.userRole)) {
    const role = await loadUserRole(req.userId);
    req.userRole = role ?? undefined;
  }

  if (!isAdminRole(req.userRole)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
