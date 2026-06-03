import prisma from '../config/database';

export const getAITrainingData = async (filters: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  active_only?: string | boolean;
}) => {
  const { page = 1, limit = 20, category, search, active_only } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { question: { contains: search, mode: 'insensitive' } },
      { answer: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (active_only === true || active_only === 'true') where.is_active = true;
  else if (active_only === false || active_only === 'false') where.is_active = false;

  const [data, total] = await Promise.all([
    prisma.ai_training_data.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.ai_training_data.count({ where }),
  ]);

  return {
    data,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  };
};

export const createQARecord = async (data: {
  category: string;
  question: string;
  answer: string;
  keywords?: string[];
  intent?: string;
  is_active?: boolean;
}) => {
  return prisma.ai_training_data.create({
    data: {
      category: data.category,
      question: data.question,
      answer: data.answer,
      keywords: data.keywords || [],
      intent: data.intent || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
    },
  });
};

export const updateQARecord = async (qaId: string, data: any) => {
  return prisma.ai_training_data.update({
    where: { training_id: qaId },
    data: {
      category: data.category,
      question: data.question,
      answer: data.answer,
      keywords: data.keywords,
      intent: data.intent,
      is_active: data.is_active,
    },
  });
};

export const deleteQARecord = async (qaId: string) => {
  await prisma.ai_training_data.delete({ where: { training_id: qaId } });
  return { message: 'Q&A record deleted successfully' };
};

export const importQARecords = async (records: any[]) => {
  let imported = 0;
  const errors: string[] = [];

  for (const record of records) {
    try {
      if (!record.question || !record.answer || !record.category) {
        errors.push(`Missing required fields: ${JSON.stringify(record)}`);
        continue;
      }
      await prisma.ai_training_data.create({
        data: {
          category: record.category,
          question: record.question,
          answer: record.answer,
          keywords: record.keywords || [],
          intent: record.intent || null,
          is_active: record.is_active !== undefined ? record.is_active : true,
        },
      });
      imported++;
    } catch (e: any) {
      errors.push(`Error importing: ${JSON.stringify(record)} - ${e.message}`);
    }
  }

  return { imported, errors };
};

export const exportQARecords = async () => {
  return prisma.ai_training_data.findMany({
    orderBy: { created_at: 'desc' },
  });
};

export const getAIMetrics = async () => {
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

  const [
    totalQuestions,
    lowConfidenceLogs,
    feedbackTrend,
    intentCounts,
  ] = await Promise.all([
    prisma.ai_chat_logs.count(),
    prisma.ai_chat_logs.findMany({
      where: { confidence_score: { lt: 0.5 } },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: { prompt: true, intent: true, confidence_score: true, created_at: true },
    }),
    prisma.$queryRaw`
      SELECT DATE(created_at) as day,
             COUNT(*) FILTER (WHERE sentiment = 'positive') as positive,
             COUNT(*) FILTER (WHERE sentiment = 'negative') as negative
      FROM ai_chat_logs
      WHERE created_at >= ${startOfWeek}
      GROUP BY DATE(created_at)
      ORDER BY day
    `,
    prisma.$queryRaw`
      SELECT intent, COUNT(*) as count
      FROM ai_chat_logs
      WHERE intent IS NOT NULL
      GROUP BY intent
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  const avgAccuracy = await prisma.$queryRaw`
    SELECT AVG(confidence_score) as avg
    FROM ai_chat_logs
    WHERE confidence_score IS NOT NULL
  `;

  const avgScore = Array.isArray(avgAccuracy) && avgAccuracy.length > 0
    ? Number((avgAccuracy[0] as any).avg ?? 0)
    : 0;

  return {
    total_questions: totalQuestions,
    avg_accuracy: Math.round(avgScore * 10000) / 100,
    top_intents: Array.isArray(intentCounts)
      ? intentCounts.map((r: any) => ({ intent: r.intent, count: Number(r.count) }))
      : [],
    low_confidence_logs: Array.isArray(lowConfidenceLogs)
      ? lowConfidenceLogs.map((l) => ({
          question: l.prompt,
          predicted_intent: l.intent,
          confidence_score: l.confidence_score ? Number(l.confidence_score) : 0,
          created_at: l.created_at?.toISOString(),
        }))
      : [],
    feedback_trend_7days: Array.isArray(feedbackTrend)
      ? feedbackTrend.map((r: any) => ({
          day: r.day instanceof Date ? r.day.toISOString().split('T')[0] : r.day,
          positive: Number(r.positive ?? 0),
          negative: Number(r.negative ?? 0),
        }))
      : [],
  };
};
