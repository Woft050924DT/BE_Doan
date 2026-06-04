import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { toPublicUser } from '../utils/userResponse';

const signToken = (user: { user_id: string; email: string; role: string }) =>
  jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

export const register = async (
  email: string,
  password: string,
  full_name: string,
  phone?: string
) => {
  if (!email || !password || !full_name) {
    throw new Error('Email, password and full name are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.users.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });
  if (existing) {
    throw new Error('Email already registered');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email: normalizedEmail,
      password_hash,
      full_name,
      phone: phone || null,
      role: 'customer',
      status: 'active',
    },
  });

  const token = signToken(user);

  return {
    token,
    user: toPublicUser(user),
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.users.findUnique({ where: { user_id: userId } });

  if (!user || user.status === 'inactive') {
    throw new Error('User not found');
  }

  return toPublicUser(user);
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.users.findFirst({
    where: {
      email: { equals: normalizedEmail, mode: 'insensitive' },
    },
  });

  if (!user || !user.password_hash) {
    throw new Error('Invalid credentials');
  }

  if (user.status && user.status !== 'active') {
    throw new Error('Account is inactive');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await prisma.users.update({
    where: { user_id: user.user_id },
    data: { last_login: new Date() },
  });

  const token = signToken(user);

  return {
    token,
    user: toPublicUser(user),
  };
};
