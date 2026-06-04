import prisma from '../config/database';

const mediaSelect = {
  media_id: true,
  filename: true,
  original_filename: true,
  file_path: true,
  file_url: true,
  file_type: true,
  mime_type: true,
  file_size: true,
  width: true,
  height: true,
  alt_text: true,
  title: true,
  description: true,
  uploaded_by: true,
  created_at: true,
} as const;

export const getAdminMedia = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  file_type?: string;
}) => {
  const { page = 1, limit = 20, search, file_type } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (file_type) where.file_type = file_type;
  if (search) {
    where.OR = [
      { filename: { contains: search, mode: 'insensitive' } },
      { alt_text: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [media, total] = await Promise.all([
    prisma.media_library.findMany({
      where,
      select: mediaSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.media_library.count({ where }),
  ]);

  const totalSizeBytes = media.reduce((sum, m) => sum + (m.file_size ? Number(m.file_size) : 0), 0);

  return {
    data: media.map((m) => ({
      id: m.media_id,
      name: m.filename,
      url: m.file_url || m.file_path || '',
      type: (m.file_type || 'image') as 'image' | 'video' | 'document',
      size: m.file_size ? Number(m.file_size) : 0,
      dimensions: m.width && m.height ? `${m.width}x${m.height}` : undefined,
      uploaded_at: m.created_at ? m.created_at.toISOString() : '',
      folder: m.alt_text || m.title || '',
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    total_size_mb: Number((totalSizeBytes / (1024 * 1024)).toFixed(2)),
  };
};

export const deleteMedia = async (mediaId: string) => {
  const media = await prisma.media_library.findUnique({ where: { media_id: mediaId } });
  if (!media) throw new Error('Media not found');
  await prisma.media_library.delete({ where: { media_id: mediaId } });
  return { message: 'Media deleted successfully' };
};

export const updateMedia = async (
  mediaId: string,
  data: Partial<{ alt_text: string; title: string; description: string }>
) => {
  const media = await prisma.media_library.findUnique({ where: { media_id: mediaId } });
  if (!media) throw new Error('Media not found');
  return prisma.media_library.update({
    where: { media_id: mediaId },
    data,
    select: mediaSelect,
  });
};
