import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
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

  const token = jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
    },
  };
};
