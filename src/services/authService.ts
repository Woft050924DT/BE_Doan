import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

const signToken = (user: { user_id: string; email: string; role: string }) => {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const userResponse = (user: any) => ({
  token: signToken(user),
  user: {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    avatar_url: user.avatar_url,
  },
});

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  await prisma.users.update({
    where: { user_id: user.user_id },
    data: { last_login: new Date() },
  });

  return userResponse(user);
};

export const register = async (data: {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}) => {
  const { email, password, full_name, phone, avatar_url } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      password_hash: passwordHash,
      full_name: full_name || email.split('@')[0],
      phone: phone || null,
      avatar_url: avatar_url || null,
      role: 'customer',
      status: 'active',
    },
  });

  return userResponse(user);
};
