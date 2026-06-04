import prisma from '../config/database';

const trainingSelect = {
  training_id: true,
  category: true,
  question: true,
  answer: true,
  keywords: true,
  intent: true,
  context: true,
  is_active: true,
  usage_count: true,
  positive_feedback: true,
  negative_feedback: true,
  created_by: true,
  created_at: true,
  updated_at: true,
} as const;

export const getAdminTrainingData = async (filters: {
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
      { question: { contains: search, mode: 'insensitive' } },
      { answer: { contains: search, mode: 'insensitive' } },
      { intent: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.ai_training_data.findMany({
      where,
      select: trainingSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.ai_training_data.count({ where }),
  ]);

  return {
    data: data.map((d) => ({
      training_id: d.training_id,
      category: d.category,
      question: d.question,
      answer: d.answer,
      keywords: d.keywords || [],
      intent: d.intent || '',
      context: d.context || null,
      is_active: d.is_active ?? true,
      usage_count: d.usage_count ?? 0,
      positive_feedback: d.positive_feedback ?? 0,
      negative_feedback: d.negative_feedback ?? 0,
      created_at: d.created_at ? d.created_at.toISOString() : '',
      updated_at: d.updated_at ? d.updated_at.toISOString() : '',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const createTrainingData = async (data: {
  category: string;
  question: string;
  answer: string;
  keywords?: string[];
  intent?: string;
  context?: any;
}) => {
  return prisma.ai_training_data.create({
    data: {
      category: data.category,
      question: data.question,
      answer: data.answer,
      keywords: data.keywords || [],
      intent: data.intent || null,
      context: data.context || null,
    },
    select: trainingSelect,
  });
};

export const updateTrainingData = async (
  trainingId: string,
  data: Partial<{
    category: string;
    question: string;
    answer: string;
    keywords: string[];
    intent: string;
    context: any;
    is_active: boolean;
  }>
) => {
  const item = await prisma.ai_training_data.findUnique({ where: { training_id: trainingId } });
  if (!item) throw new Error('Training data not found');
  return prisma.ai_training_data.update({
    where: { training_id: trainingId },
    data,
    select: trainingSelect,
  });
};

export const deleteTrainingData = async (trainingId: string) => {
  const item = await prisma.ai_training_data.findUnique({ where: { training_id: trainingId } });
  if (!item) throw new Error('Training data not found');
  await prisma.ai_training_data.delete({ where: { training_id: trainingId } });
  return { message: 'Training data deleted successfully' };
};
