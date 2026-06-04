import prisma from '../config/database';

const postSelect = {
  post_id: true,
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  featured_image: true,
  status: true,
  category_id: true,
  author_id: true,
  view_count: true,
  meta_title: true,
  meta_description: true,
  meta_keywords: true,
  published_at: true,
  created_at: true,
  updated_at: true,
} as const;

export const getAdminPosts = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const { page = 1, limit = 20, search, status } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.blog_posts.findMany({
      where,
      select: postSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.blog_posts.count({ where }),
  ]);

  const enriched = await Promise.all(
    posts.map(async (p) => {
      const [category, author] = await Promise.all([
        p.category_id ? prisma.categories.findUnique({ where: { category_id: p.category_id }, select: { name: true } }) : null,
        p.author_id ? prisma.users.findUnique({ where: { user_id: p.author_id }, select: { full_name: true } }) : null,
      ]);
      return {
        post_id: p.post_id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        featured_image: p.featured_image || '',
        status: p.status || 'draft',
        category_name: category?.name || '',
        author_name: author?.full_name || '',
        view_count: p.view_count ?? 0,
        meta_title: p.meta_title || '',
        meta_description: p.meta_description || '',
        published_at: p.published_at ? p.published_at.toISOString() : '',
        created_at: p.created_at ? p.created_at.toISOString() : '',
      };
    })
  );

  return {
    data: enriched.map((p) => ({
      post_id: p.post_id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      thumbnail: p.featured_image || '',
      category: p.category_name || '',
      author_name: p.author_name || '',
      author_avatar: p.author_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author_name)}&background=random` : '',
      status: p.status || 'draft',
      published_at: p.published_at || '',
      views: p.view_count ?? 0,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getPostById = async (postId: string) => {
  const post = await prisma.blog_posts.findUnique({
    where: { post_id: postId },
    select: { ...postSelect, content: true },
  });
  if (!post) throw new Error('Post not found');
  return post;
};

export const createPost = async (data: {
  title: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  status?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  published_at?: string;
}) => {
  const slug =
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9\u00e0-\u024f\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now().toString(36);

  const post = await prisma.blog_posts.create({
    data: {
      title: data.title,
      slug,
      content: data.content || null,
      excerpt: data.excerpt || null,
      featured_image: data.featured_image || null,
      status: data.status || 'draft',
      category_id: data.category_id || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      meta_keywords: data.meta_keywords || null,
      published_at: data.published_at ? new Date(data.published_at) : null,
    },
    select: postSelect,
  });

  return {
    post_id: post.post_id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    thumbnail: post.featured_image || '',
    category: '',
    author_name: '',
    author_avatar: '',
    status: post.status || 'draft',
    published_at: post.published_at ? post.published_at.toISOString() : '',
    views: post.view_count ?? 0,
  };
};

export const updatePost = async (
  postId: string,
  data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    featured_image: string;
    status: string;
    category_id: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    published_at: string;
  }>
) => {
  const post = await prisma.blog_posts.findUnique({ where: { post_id: postId } });
  if (!post) throw new Error('Post not found');

  const updated = await prisma.blog_posts.update({
    where: { post_id: postId },
    data: {
      ...data,
      published_at: data.published_at ? new Date(data.published_at) : undefined,
    },
    select: postSelect,
  });

  const category = updated.category_id
    ? await prisma.categories.findUnique({ where: { category_id: updated.category_id }, select: { name: true } })
    : null;
  const author = updated.author_id
    ? await prisma.users.findUnique({ where: { user_id: updated.author_id }, select: { full_name: true } })
    : null;

  return {
    post_id: updated.post_id,
    title: updated.title,
    slug: updated.slug,
    excerpt: updated.excerpt || '',
    thumbnail: updated.featured_image || '',
    category: category?.name || '',
    author_name: author?.full_name || '',
    author_avatar: author?.full_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name)}&background=random` : '',
    status: updated.status || 'draft',
    published_at: updated.published_at ? updated.published_at.toISOString() : '',
    views: updated.view_count ?? 0,
  };
};

export const deletePost = async (postId: string) => {
  const post = await prisma.blog_posts.findUnique({ where: { post_id: postId } });
  if (!post) throw new Error('Post not found');
  await prisma.blog_posts.delete({ where: { post_id: postId } });
  return { message: 'Post deleted successfully' };
};
