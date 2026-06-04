"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUser = void 0;
const toPublicUser = (user) => ({
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
exports.toPublicUser = toPublicUser;
