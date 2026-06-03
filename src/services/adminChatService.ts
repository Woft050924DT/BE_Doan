import prisma from '../config/database';

const conversationSelect = {
  conversation_id: true,
  status: true,
  priority: true,
  assigned_to: true,
  last_message_at: true,
  created_at: true,
  tags: true,
  users_conversations_assigned_toTousers: {
    select: { user_id: true, full_name: true, avatar_url: true },
  },
  users_conversations_user_idTousers: {
    select: { user_id: true, full_name: true, email: true, phone: true, avatar_url: true },
  },
} as const;

export const getConversations = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
}) => {
  const { page = 1, limit = 20, status, priority, assigned_to, search } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigned_to) where.assigned_to = assigned_to;
  if (search) {
    where.OR = [
      { customer_name: { contains: search, mode: 'insensitive' } },
      { customer_email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [conversations, total] = await Promise.all([
    prisma.conversations.findMany({
      where,
      select: conversationSelect,
      skip,
      take: Number(limit),
      orderBy: { last_message_at: 'desc' },
    }),
    prisma.conversations.count({ where }),
  ]);

  const enriched = await Promise.all(
    conversations.map(async (c) => {
      const lastMsg = await prisma.messages.findFirst({
        where: { conversation_id: c.conversation_id },
        orderBy: { created_at: 'desc' },
        select: { content: true, created_at: true },
      });
      const unread = await prisma.messages.count({
        where: { conversation_id: c.conversation_id, is_read: false, sender_type: { not: 'staff' } },
      });
      return {
        ...c,
        last_message: lastMsg?.content || null,
        last_message_at: lastMsg?.created_at || c.last_message_at,
        unread_count: unread,
        assigned_staff_name: c.users_conversations_assigned_toTousers?.full_name || null,
        customer: c.users_conversations_user_idTousers,
      };
    })
  );

  return {
    conversations: enriched,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  };
};

export const getConversationDetail = async (conversationId: string) => {
  const conversation = await prisma.conversations.findUnique({
    where: { conversation_id: conversationId },
    include: {
      users_conversations_user_idTousers: {
        select: { user_id: true, full_name: true, email: true, phone: true, avatar_url: true },
      },
      users_conversations_assigned_toTousers: {
        select: { user_id: true, full_name: true, avatar_url: true },
      },
    },
  });
  if (!conversation) throw new Error('Conversation not found');

  const messages = await prisma.messages.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: 'asc' },
    include: {
      users: { select: { user_id: true, full_name: true, avatar_url: true } },
    },
  });

  let customerOrders: any[] = [];
  if (conversation.user_id) {
    customerOrders = await prisma.orders.findMany({
      where: { user_id: conversation.user_id },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { order_items: true, payments: true },
    });
  }

  return {
    conversation,
    messages: messages.map((m) => ({
      message_id: m.message_id,
      conversation_id: m.conversation_id,
      sender_type: m.sender_type,
      sender_id: m.sender_id,
      sender_name: m.sender_type === 'bot' ? 'Bot' : m.users?.full_name || 'Unknown',
      text: m.content,
      created_at: m.created_at,
    })),
    customer_orders: customerOrders,
    internal_notes: conversation.metadata as any || null,
  };
};

export const sendStaffMessage = async (conversationId: string, staffId: string, text: string) => {
  const message = await prisma.messages.create({
    data: {
      conversation_id: conversationId,
      sender_id: staffId,
      sender_type: 'staff',
      content: text,
    },
  });

  await prisma.conversations.update({
    where: { conversation_id: conversationId },
    data: {
      last_message_at: new Date(),
      status: 'active',
    },
  });

  return message;
};

export const updateConversation = async (
  conversationId: string,
  data: {
    assigned_to?: string;
    priority?: string;
    status?: string;
    tags?: string[];
    internal_notes?: string;
  }
) => {
  const updateData: any = {};
  if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to || null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.internal_notes !== undefined) {
    const conv = await prisma.conversations.findUnique({ where: { conversation_id: conversationId } });
    updateData.metadata = { ...((conv?.metadata as any) || {}), internal_notes: data.internal_notes };
  }

  return prisma.conversations.update({
    where: { conversation_id: conversationId },
    data: updateData,
  });
};

export const getStaffList = async () => {
  const staff = await prisma.users.findMany({
    where: { role: { in: ['staff', 'admin'] } },
    select: {
      user_id: true,
      full_name: true,
      role: true,
      avatar_url: true,
      last_login: true,
    },
  });
  return staff.map((s) => ({
    ...s,
    is_online: s.last_login ? (Date.now() - new Date(s.last_login).getTime() < 300000) : false,
  }));
};

export const getQuickReplies = async () => {
  return prisma.chat_quick_replies.findMany({
    where: { is_active: true },
    select: { reply_id: true, title: true, message: true, category: true },
    orderBy: { display_order: 'asc' },
  });
};
