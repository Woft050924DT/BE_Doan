import prisma from '../config/database';

const settingSelect = {
  setting_id: true,
  category: true,
  key: true,
  value: true,
  data_type: true,
  description: true,
  is_public: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
} as const;

export const getAdminSettings = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) => {
  const { page = 1, limit = 20, search, category } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { key: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [settings, total] = await Promise.all([
    prisma.settings.findMany({
      where,
      select: settingSelect,
      skip,
      take: Number(limit),
      orderBy: { category: 'asc' },
    }),
    prisma.settings.count({ where }),
  ]);

  return {
    data: settings.map((s) => ({
      setting_id: s.setting_id,
      category: s.category,
      key: s.key,
      value: s.value || '',
      data_type: s.data_type || 'string',
      description: s.description || '',
      is_public: s.is_public ?? false,
      updated_at: s.updated_at ? s.updated_at.toISOString() : '',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateSetting = async (key: string, category: string, data: {
  value?: string;
  data_type?: string;
  description?: string;
  is_public?: boolean;
}) => {
  const setting = await prisma.settings.findUnique({
    where: { category_key: { category, key } },
  });
  if (!setting) throw new Error('Setting not found');
  return prisma.settings.update({
    where: { category_key: { category, key } },
    data,
    select: settingSelect,
  });
};

export const upsertSetting = async (data: {
  category: string;
  key: string;
  value?: string;
  data_type?: string;
  description?: string;
  is_public?: boolean;
}) => {
  return prisma.settings.upsert({
    where: { category_key: { category: data.category, key: data.key } },
    update: { value: data.value || null },
    create: {
      category: data.category,
      key: data.key,
      value: data.value || null,
      data_type: data.data_type || 'string',
      description: data.description || null,
      is_public: data.is_public ?? false,
    },
    select: settingSelect,
  });
};
