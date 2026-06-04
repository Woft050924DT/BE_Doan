export const toPublicUser = (user: {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  status?: string | null;
  email_verified?: boolean | null;
  created_at?: Date | null;
}) => ({
  user_id: user.user_id,
  email: user.email,
  full_name: user.full_name,
  phone: user.phone,
  role: user.role,
  avatar_url: user.avatar_url,
  status: user.status,
  email_verified: user.email_verified,
  created_at: user.created_at,
});
