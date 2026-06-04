import prisma from '../config/database';

const staffSelect = {
  user_id: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  role: true,
  status: true,
  email_verified: true,
  last_login: true,
  created_at: true,
} as const;

export const getAdminStaff = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const { page = 1, limit = 20, search, role, status } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (role) {
    where.role = role;
  } else {
    where.role = { in: ['staff', 'admin'] };
  }
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [staff, total] = await Promise.all([
    prisma.users.findMany({
      where,
      select: staffSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    data: staff.map((s) => ({
      user_id: s.user_id,
      email: s.email,
      full_name: s.full_name,
      phone: s.phone || '',
      avatar_url: s.avatar_url || '',
      role: s.role,
      status: s.status || 'active',
      email_verified: s.email_verified ?? false,
      last_login: s.last_login ? s.last_login.toISOString() : '',
      created_at: s.created_at ? s.created_at.toISOString() : '',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateStaffStatus = async (staffId: string, status: string) => {
  const staff = await prisma.users.findUnique({ where: { user_id: staffId } });
  if (!staff) throw new Error('Staff not found');
  return prisma.users.update({
    where: { user_id: staffId },
    data: { status },
    select: staffSelect,
  });
};

export const updateStaffRole = async (staffId: string, role: string) => {
  const staff = await prisma.users.findUnique({ where: { user_id: staffId } });
  if (!staff) throw new Error('Staff not found');
  return prisma.users.update({
    where: { user_id: staffId },
    data: { role },
    select: staffSelect,
  });
};

export const updateStaff = async (staffId: string, data: { status?: string; role?: string }) => {
  const staff = await prisma.users.findUnique({ where: { user_id: staffId } });
  if (!staff) throw new Error('Staff not found');
  const updateData: any = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.role !== undefined) updateData.role = data.role;
  return prisma.users.update({
    where: { user_id: staffId },
    data: updateData,
    select: staffSelect,
  });
};
