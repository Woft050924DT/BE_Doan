import prisma from '../config/database';

export const getAILogs = async (filters: {
  page?: number;
  limit?: number;
  helpful?: boolean;
  handed_off?: boolean;
  low_confidence?: boolean;
}) => {
  const { page = 1, limit = 50 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const logs = await prisma.ai_chat_logs.findMany({
    select: {
      log_id: true,
      session_id: true,
      prompt: true,
      response: true,
      intent: true,
      confidence_score: true,
      sentiment: true,
      tokens_used: true,
      response_time_ms: true,
      created_at: true,
      messages: {
        select: {
          conversation_id: true,
          sender_id: true,
          content: true,
          users: {
            select: { full_name: true, email: true },
          },
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: { created_at: 'desc' },
  });

  const total = await prisma.ai_chat_logs.count();

  return {
    data: logs.map((l) => ({
      id: l.log_id,
      session_id: l.session_id || '',
      user_id: l.messages?.[0]?.sender_id || '',
      user_name: l.messages?.[0]?.users?.full_name || '',
      user_email: l.messages?.[0]?.users?.email || '',
      question: l.prompt || '',
      reply: l.response || '',
      intent: l.intent || '',
      confidence: l.confidence_score ? Number(l.confidence_score) : 0,
      was_helpful: null,
      handed_off: false,
      created_at: l.created_at ? l.created_at.toISOString() : '',
      duration: l.response_time_ms || 0,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const exportAILogs = async () => {
  const logs = await prisma.ai_chat_logs.findMany({
    orderBy: { created_at: 'desc' },
    take: 1000,
    select: {
      log_id: true,
      session_id: true,
      prompt: true,
      response: true,
      intent: true,
      confidence_score: true,
      created_at: true,
    },
  });

  return logs.map((l) => ({
    id: l.log_id,
    session_id: l.session_id || '',
    user_id: '',
    user_name: '',
    user_email: '',
    question: l.prompt || '',
    reply: l.response || '',
    intent: l.intent || '',
    confidence: l.confidence_score ? Number(l.confidence_score) : 0,
    was_helpful: null,
    handed_off: false,
    created_at: l.created_at ? l.created_at.toISOString() : '',
    duration: 0,
  }));
};
