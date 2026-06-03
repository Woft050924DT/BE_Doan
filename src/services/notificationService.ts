import prisma from '../config/database';

const notificationSelect = {
  notification_id: true,
  user_id: true,
  type: true,
  title: true,
  message: true,
  action_url: true,
  icon: true,
  is_read: true,
  read_at: true,
  data: true,
  created_at: true,
} as const;

export const getNotifications = async (userId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notifications.findMany({
      where: { user_id: userId },
      select: notificationSelect,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.notifications.count({ where: { user_id: userId } }),
  ]);

  return {
    notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notifications.count({
    where: { user_id: userId, is_read: false },
  });
  return { count };
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notifications.findFirst({
    where: { notification_id: notificationId, user_id: userId },
  });
  if (!notification) throw new Error('Notification not found');

  return prisma.notifications.update({
    where: { notification_id: notificationId },
    data: { is_read: true, read_at: new Date() },
    select: notificationSelect,
  });
};

export const markAllAsRead = async (userId: string) => {
  await prisma.notifications.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  });
  return { message: 'All notifications marked as read' };
};
