import prisma from '../config/database';

const quickReplySelect = {
  reply_id: true,
  category: true,
  title: true,
  message: true,
  shortcut: true,
  display_order: true,
  is_active: true,
  created_by: true,
  created_at: true,
  updated_at: true,
} as const;

export const getAdminQuickReplies = async (filters: {
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
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { shortcut: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [replies, total] = await Promise.all([
    prisma.chat_quick_replies.findMany({
      where,
      select: quickReplySelect,
      skip,
      take: Number(limit),
      orderBy: { display_order: 'asc' },
    }),
    prisma.chat_quick_replies.count({ where }),
  ]);

  return {
    data: replies.map((r) => ({
      reply_id: r.reply_id,
      category: r.category || '',
      title: r.title,
      message: r.message,
      shortcut: r.shortcut || '',
      sort_order: r.display_order ?? 0,
      is_active: r.is_active ?? true,
      created_at: r.created_at ? r.created_at.toISOString() : '',
      updated_at: r.updated_at ? r.updated_at.toISOString() : '',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const createQuickReply = async (data: {
  category?: string;
  title: string;
  message: string;
  shortcut?: string;
  sort_order?: number;
}) => {
  return prisma.chat_quick_replies.create({
    data: {
      category: data.category || null,
      title: data.title,
      message: data.message,
      shortcut: data.shortcut || null,
      display_order: data.sort_order ?? 0,
    },
    select: quickReplySelect,
  });
};

export const updateQuickReply = async (
  replyId: string,
  data: Partial<{
    category: string;
    title: string;
    message: string;
    shortcut: string;
    sort_order: number;
    is_active: boolean;
  }>
) => {
  const reply = await prisma.chat_quick_replies.findUnique({ where: { reply_id: replyId } });
  if (!reply) throw new Error('Quick reply not found');
  const updateData: any = { ...data };
  if (data.sort_order !== undefined) {
    updateData.display_order = data.sort_order;
    delete updateData.sort_order;
  }
  return prisma.chat_quick_replies.update({
    where: { reply_id: replyId },
    data: updateData,
    select: quickReplySelect,
  });
};

export const deleteQuickReply = async (replyId: string) => {
  const reply = await prisma.chat_quick_replies.findUnique({ where: { reply_id: replyId } });
  if (!reply) throw new Error('Quick reply not found');
  await prisma.chat_quick_replies.delete({ where: { reply_id: replyId } });
  return { message: 'Quick reply deleted successfully' };
};
