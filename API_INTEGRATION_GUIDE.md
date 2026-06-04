# Hướng dẫn ghép API Backend vào Frontend

**Base URL:** `http://localhost:3001`
**Auth Header:** `Authorization: Bearer <token>`

Mọi request đều gửi kèm header:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Token lấy từ response đăng nhập/đăng ký, lưu vào `localStorage.setItem('token', data.token)`.

---

## 1. Authentication

### 1.1. Đăng nhập

```typescript
// POST /api/auth/login
const res = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();

// Lưu token
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Điều hướng theo role
if (data.user.role === 'admin') router.push('/admin');
else if (data.user.role === 'staff') router.push('/staff');
else router.push('/account');
```

### 1.2. Đăng ký

```typescript
// POST /api/auth/register
const res = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    full_name: 'Nguyễn Văn A',
    phone: '0901234567',
  }),
});
// Response giống login → lưu token + điều hướng về /account
```

### 1.3. Middleware auth trong Next.js (route protection)

```typescript
// middleware.ts hoặc trong page component
const token = localStorage.getItem('token');

if (!token) {
  router.push('/login');
} else {
  // decode token (JWT decode) để lấy role
  const decoded = JSON.parse(atob(token.split('.')[1]));
  if (decoded.role === 'admin') router.push('/admin');
  else router.push('/account');
}
```

---

## 2. Products

### 2.1. Danh sách sản phẩm (trang chủ / danh mục)

```typescript
// GET /api/products
const params = new URLSearchParams({
  page: '1',
  limit: '20',
  category_id: 'uuid-cua-danh-muc',  // optional
  brand_id: 'uuid-cua-thuong-hieu',  // optional
  featured: 'true',                    // optional
  best_seller: 'true',                // optional
  new_arrival: 'true',                // optional
  q: 'iphone',                        // optional - search
  sort: 'newest',                     // optional
});

const res = await fetch(`http://localhost:3001/api/products?${params}`);
const { products, pagination } = await res.json();
```

### 2.2. Chi tiết sản phẩm

```typescript
// GET /api/products/:id
const res = await fetch(`http://localhost:3001/api/products/${productId}`);
const product = await res.json();
```

### 2.3. Thương hiệu (filter sidebar)

```typescript
// GET /api/products/brands
const res = await fetch('http://localhost:3001/api/products/brands');
const brands = await res.json();
// → [{ brand_id, name, slug, logo_url }]
```

### 2.4. Tìm kiếm sản phẩm (header search)

```typescript
// GET /api/products?q=iphone
const res = await fetch(`http://localhost:3001/api/products?q=${encodeURIComponent(searchTerm)}`);
const { products, pagination } = await res.json();
```

### 2.5. Đánh giá sản phẩm

```typescript
// Lấy đánh giá - GET /api/products/:id/reviews
const res = await fetch(`http://localhost:3001/api/products/${productId}/reviews`);
const reviews = await res.json();

// Thêm đánh giá - POST /api/products/:id/reviews
const res = await fetch(`http://localhost:3001/api/products/${productId}/reviews`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
  body: JSON.stringify({
    rating: 5,
    title: 'Sản phẩm tuyệt vời',
    comment: 'Rất hài lòng...',
    images: ['https://...'],     // optional
    order_id: 'uuid',          // optional - để verified purchase
  }),
});

// Đánh dấu hữu ích - POST /api/products/:id/reviews/:reviewId/helpful
await fetch(`http://localhost:3001/api/products/${productId}/reviews/${reviewId}/helpful`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
});
```

---

## 3. Cart (Giỏ hàng)

### 3.1. Lấy giỏ hàng

```typescript
// GET /api/cart
const res = await fetch('http://localhost:3001/api/cart', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const cart = await res.json();
```

### 3.2. Thêm vào giỏ

```typescript
// POST /api/cart
await fetch('http://localhost:3001/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    product_id: 'uuid',
    variant_id: 'uuid',   // optional
    quantity: 1,
  }),
});
// Response trả về full cart
```

### 3.3. Cập nhật số lượng

```typescript
// PUT /api/cart/:cartItemId
await fetch(`http://localhost:3001/api/cart/${cartItemId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ quantity: 3 }),
});
```

### 3.4. Xóa sản phẩm khỏi giỏ

```typescript
// DELETE /api/cart/:cartItemId
await fetch(`http://localhost:3001/api/cart/${cartItemId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

### 3.5. Xóa toàn bộ giỏ hàng

```typescript
// DELETE /api/cart
await fetch('http://localhost:3001/api/cart', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## 4. Orders (Đơn hàng)

### 4.1. Tùy chọn checkout (shipping + payment)

```typescript
// GET /api/orders/checkout-options
const res = await fetch('http://localhost:3001/api/orders/checkout-options', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { shipping_methods, payment_methods } = await res.json();
// FE hiển thị dropdown chọn phương thức vận chuyển/thanh toán
```

### 4.2. Áp dụng mã giảm giá

```typescript
// POST /api/coupons/validate
const couponRes = await fetch('http://localhost:3001/api/coupons/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    coupon_code: 'SALE10',
    cart_total: 100000000,
  }),
});
const couponResult = await couponRes.json();

if (couponResult.valid) {
  // Hiển thị giảm giá
  setDiscount(couponResult.discount_amount);
} else {
  // Hiển thị thông báo lỗi
  alert(couponResult.message);
}
```

### 4.3. Đặt hàng (checkout)

```typescript
// POST /api/orders
const res = await fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    customer_name: 'Nguyễn Văn A',
    customer_email: 'user@example.com',
    customer_phone: '0901234567',
    shipping_address_line1: '123 Nguyễn Trãi',
    shipping_city: 'TP HCM',
    shipping_district: 'Quận 1',
    shipping_ward: 'Phường Bến Nghé',
    shipping_country: 'Vietnam',
    // billing address - nếu khác shipping thì điền, không thì bỏ trống
    payment_method: 'cod',       // cod | bank_transfer | momo | vnpay
    shipping_method: 'standard', // standard | express
    coupon_code: 'SALE10',      // optional
    notes: 'Giao giờ hành chính', // optional
  }),
});
const order = await res.json();
// → Chuyển hướng đến trang xác nhận đơn hàng
router.push(`/account/orders/${order.order_id}`);
```

### 4.4. Mua ngay

```typescript
// POST /api/orders/buy-now
const res = await fetch('http://localhost:3001/api/orders/buy-now', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    product_id: 'uuid',
    variant_id: 'uuid',
    quantity: 1,
    // + các field address/payment như placeOrder
    shipping_method: 'express',
    payment_method: 'cod',
    shipping_address_line1: '...',
    shipping_city: 'TP HCM',
    customer_name: '...',
    customer_email: '...',
    customer_phone: '...',
  }),
});
const order = await res.json();
```

### 4.5. Danh sách đơn hàng (Account)

```typescript
// GET /api/orders
const params = new URLSearchParams({ page: '1', limit: '10', status: 'pending' });
const res = await fetch(`http://localhost:3001/api/orders?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { orders, pagination } = await res.json();
```

### 4.6. Chi tiết đơn hàng

```typescript
// GET /api/orders/:orderId
const res = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const order = await res.json();
```

### 4.7. Hủy đơn hàng

```typescript
// POST /api/orders/:orderId/cancel
const res = await fetch(`http://localhost:3001/api/orders/${orderId}/cancel`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ reason: 'Không muốn mua nữa' }),
});
```

### 4.8. Theo dõi đơn hàng (trong Chat Widget hoặc Account)

```typescript
// GET /api/orders/:orderId/track
const res = await fetch(`http://localhost:3001/api/orders/${orderId}/track`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { order_number, status, tracking_number, timeline } = await res.json();
// timeline = [{ status, label, timestamp, note }]
```

---

## 5. Profile

### 5.1. Lấy thông tin tài khoản

```typescript
// GET /api/profile
const res = await fetch('http://localhost:3001/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const profile = await res.json();
// profile = { user_id, email, full_name, phone, role, avatar_url, user_addresses }
```

### 5.2. Cập nhật tài khoản

```typescript
// PUT /api/profile
await fetch('http://localhost:3001/api/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ full_name: 'Tên mới', phone: '0909876543' }),
});
```

### 5.3. Đổi mật khẩu

```typescript
// PATCH /api/profile/password
const res = await fetch('http://localhost:3001/api/profile/password', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    current_password: 'oldpassword',
    new_password: 'newpassword123',
  }),
});
if (res.ok) alert('Đổi mật khẩu thành công');
```

### 5.4. Thống kê tài khoản (Account Overview)

```typescript
// GET /api/profile/stats
const res = await fetch('http://localhost:3001/api/profile/stats', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { total_orders, pending_orders, total_spent, total_reviews } = await res.json();
// FE hiển thị: "Bạn đã đặt 12 đơn hàng, 2 đơn đang xử lý"
```

### 5.5. Xóa tài khoản

```typescript
// DELETE /api/profile
if (confirm('Bạn có chắc muốn xóa tài khoản?')) {
  await fetch('http://localhost:3001/api/profile', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
}
```

### 5.6. Địa chỉ

```typescript
// Lấy danh sách - GET /api/profile/addresses
const res = await fetch('http://localhost:3001/api/profile/addresses', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const addresses = await res.json();

// Thêm - POST /api/profile/addresses
await fetch('http://localhost:3001/api/profile/addresses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    address_type: 'home',
    full_name: 'Nguyễn Văn A',
    phone: '0901234567',
    address_line1: '123 Nguyễn Trãi',
    city: 'TP HCM',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    is_default: true,
  }),
});

// Cập nhật - PUT /api/profile/addresses/:addressId
await fetch(`http://localhost:3001/api/profile/addresses/${addressId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ ...updates }),
});

// Xóa - DELETE /api/profile/addresses/:addressId
await fetch(`http://localhost:3001/api/profile/addresses/${addressId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## 6. Notifications

### 6.1. Lấy thông báo

```typescript
// GET /api/notifications
const res = await fetch('http://localhost:3001/api/notifications?page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { notifications, pagination } = await res.json();
```

### 6.2. Badge số thông báo chưa đọc (Header Bell icon)

```typescript
// GET /api/notifications/unread-count
const res = await fetch('http://localhost:3001/api/notifications/unread-count', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { count } = await res.json();
// Hiển thị badge: {count > 0 && <span>{count}</span>}
```

### 6.3. Đánh dấu đã đọc

```typescript
// Một thông báo - PATCH /api/notifications/:id/read
await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Tất cả - PATCH /api/notifications/read-all
await fetch('http://localhost:3001/api/notifications/read-all', {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## 7. Wishlist (Yêu thích)

### 7.1. Lấy danh sách yêu thích

```typescript
// GET /api/wishlist
const res = await fetch('http://localhost:3001/api/wishlist', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { items } = await res.json();
// items = [{ wishlist_item_id, product_id, variant_id, products: { name, price, ... } }]
```

### 7.2. Thêm vào yêu thích

```typescript
// POST /api/wishlist
// FE gọi khi user nhấn nút ❤ tim trên Product/Detail
await fetch('http://localhost:3001/api/wishlist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ product_id: 'uuid', variant_id: 'uuid' }),
});
// Cập nhật UI: đổi icon ❤ → 💗, thêm vào wishlist
```

### 7.3. Xóa khỏi yêu thích

```typescript
// DELETE /api/wishlist/:productId
await fetch(`http://localhost:3001/api/wishlist/${productId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## 8. Coupon của user (Account > Voucher)

```typescript
// GET /api/coupons
const res = await fetch('http://localhost:3001/api/coupons', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const coupons = await res.json();
// [{ coupon_id, code, title, discount_type, discount_value,
//   min_order_amount, max_discount, expires_at, is_used, is_expired }]
// FE hiển thị: card coupon với màu xám nếu is_expired hoặc is_used
```

---

## 9. AI Chatbot

### 9.1. Gửi tin nhắn

```typescript
// POST /api/chat
let sessionId = localStorage.getItem('chat_session_id');

const res = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,  // optional - guest cũng được
  },
  body: JSON.stringify({
    message: 'Cho tôi hỏi về iPhone 15',
    session_id: sessionId || undefined,
    context: {
      last_order_id: 'uuid | null',
      last_product_id: 'uuid | null',
      intent: null,
    },
  }),
});
const { reply, session_id, intent, confidence, suggestions, handoff, data } = await res.json();

// Lưu session_id để maintain context cho các tin nhắn tiếp theo
if (!sessionId) localStorage.setItem('chat_session_id', session_id);

// Hiển thị reply
appendMessage('bot', reply);

// Nếu handoff = true → hiển thị gợi ý chuyển staff
if (handoff) showConnectStaffButton();

// Hiển thị gợi ý
suggestions.forEach(s => addSuggestionButton(s));
```

### 9.2. Lịch sử chat

```typescript
// GET /api/chat/history?session_id=...&limit=50
const res = await fetch(`http://localhost:3001/api/chat/history?session_id=${sessionId}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const messages = await res.json();
// [{ message_id, sender_type, content, created_at }]
```

---

## 10. Admin - Dashboard

```typescript
// GET /api/admin/dashboard
// Role required: admin
const res = await fetch('http://localhost:3001/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { kpis, revenue_7days, order_status_breakdown, recent_orders, open_conversations } = await res.json();

// kpis.today_revenue → KPI Card
// revenue_7days → Chart (7 ngày)
// order_status_breakdown → Pie chart
// recent_orders → Bảng 5 đơn mới
// open_conversations → Danh sách chat đang mở
```

---

## 11. Admin - Quản lý Đơn hàng

```typescript
// Danh sách - GET /api/admin/orders
const params = new URLSearchParams({
  page: '1', limit: '20',
  status: 'pending',
  search: 'DH2024',
  date_from: '2024-01-01',
  date_to: '2024-01-31',
  payment_status: 'unpaid',
});
const res = await fetch(`http://localhost:3001/api/admin/orders?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { orders, pagination } = await res.json();

// Cập nhật trạng thái - PATCH /api/admin/orders/:orderId
await fetch(`http://localhost:3001/api/admin/orders/${orderId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    status: 'processing',
    payment_status: 'paid',
    tracking_number: 'GHN123456',
    internal_notes: 'Giao giờ hành chính',
  }),
});

// Export - GET /api/admin/orders/export
const exportRes = await fetch(`http://localhost:3001/api/admin/orders/export?status=delivered`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const ordersData = await exportRes.json();
// Convert to CSV/Excel and download
```

---

## 12. Admin - Quản lý Sản phẩm

```typescript
// Tạo sản phẩm - POST /api/admin/products
await fetch('http://localhost:3001/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: 'iPhone 15 Pro Max',
    sku: 'IPP15PM-256',
    price: 34990000,
    category_id: 'uuid',
    brand_id: 'uuid',
    status: 'published',
  }),
});

// Cập nhật - PUT /api/admin/products/:id
await fetch(`http://localhost:3001/api/admin/products/${productId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ ...updates }),
});

// Xóa - DELETE /api/admin/products/:id
await fetch(`http://localhost:3001/api/admin/products/${productId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Upload ảnh - POST /api/admin/products/:id/images
// NOTE: FE cần upload file lên Cloudinary/S3 trước, gửi URL lên đây
await fetch(`http://localhost:3001/api/admin/products/${productId}/images`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    image_url: 'https://cdn.example.com/iphone15.jpg',
    alt_text: 'iPhone 15 Pro Max',
    display_order: 1,
  }),
});

// Xóa ảnh - DELETE /api/admin/products/:id/images/:imageId
await fetch(`http://localhost:3001/api/admin/products/${productId}/images/${imageId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Tạo biến thể - POST /api/admin/products/:id/variants
await fetch(`http://localhost:3001/api/admin/products/${productId}/variants`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    sku: 'IPP15PM-256-BLK',
    name: '256GB - Titan Đen',
    option1_name: 'Dung lượng',
    option1_value: '256GB',
    option2_name: 'Màu sắc',
    option2_value: 'Titan Đen',
    price: 34990000,
    stock_quantity: 50,
  }),
});

// Cập nhật biến thể - PUT /api/admin/products/:id/variants/:variantId
await fetch(`http://localhost:3001/api/admin/products/${productId}/variants/${variantId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ ...updates }),
});
```

---

## 13. Admin - Quản lý Reviews

```typescript
// Danh sách - GET /api/admin/reviews
const params = new URLSearchParams({
  page: '1', limit: '20',
  search: 'iphone',
  approved: 'false',  // false = chờ duyệt, true = đã duyệt, bỏ = tất cả
});
const res = await fetch(`http://localhost:3001/api/admin/reviews?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { data: reviews, pagination } = await res.json();

// Duyệt - PATCH /api/admin/reviews/:id/approve
await fetch(`http://localhost:3001/api/admin/reviews/${reviewId}/approve`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Từ chối - PATCH /api/admin/reviews/:id/reject
await fetch(`http://localhost:3001/api/admin/reviews/${reviewId}/reject`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Xóa - DELETE /api/admin/reviews/:id
await fetch(`http://localhost:3001/api/admin/reviews/${reviewId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## 14. Admin - Quản lý Coupons

```typescript
// Danh sách - GET /api/admin/coupons
const params = new URLSearchParams({
  page: '1', limit: '20',
  search: 'SUMMER',
  status: 'active',  // active | scheduled | expired | disabled
});
const res = await fetch(`http://localhost:3001/api/admin/coupons?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { data: coupons, pagination } = await res.json();

// Tạo - POST /api/admin/coupons
await fetch('http://localhost:3001/api/admin/coupons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    code: 'SUMMER2024',
    title: 'Khuyến mãi mùa hè',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 500000,
    maxDiscount: 500000,
    usageLimit: 1000,
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
  }),
});

// Cập nhật - PUT /api/admin/coupons/:id
await fetch(`http://localhost:3001/api/admin/coupons/${couponId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ ...updates }),
});

// Toggle status - PATCH /api/admin/coupons/:id/toggle
await fetch(`http://localhost:3001/api/admin/coupons/${couponId}/toggle`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Xóa - DELETE /api/admin/coupons/:id
await fetch(`http://localhost:3001/api/admin/coupons/${couponId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```

---

## 15. Admin - AI Training Data

```typescript
// Danh sách - GET /api/admin/ai-training
const params = new URLSearchParams({
  page: '1', limit: '20',
  category: 'FAQ',
  search: 'đổi trả',
  active_only: 'true',
});
const res = await fetch(`http://localhost:3001/api/admin/ai-training?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { data, pagination } = await res.json();

// Tạo Q&A - POST /api/admin/ai-training
await fetch('http://localhost:3001/api/admin/ai-training', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    category: 'FAQ',
    question: 'Chính sách đổi trả như thế nào?',
    answer: 'Bạn có thể hoàn trả trong vòng 7 ngày...',
    keywords: ['đổi trả', 'hoàn', 'trả lại'],
    intent: 'return_policy',
    is_active: true,
  }),
});

// Cập nhật - PUT /api/admin/ai-training/:id
await fetch(`http://localhost:3001/api/admin/ai-training/${qaId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ ...updates }),
});

// Xóa - DELETE /api/admin/ai-training/:id
await fetch(`http://localhost:3001/api/admin/ai-training/${qaId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Import CSV - POST /api/admin/ai-training/import
await fetch('http://localhost:3001/api/admin/ai-training/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ records: [...] }),
});

// Export - GET /api/admin/ai-training/export
const exportRes = await fetch('http://localhost:3001/api/admin/ai-training/export', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const qaData = await exportRes.json();

// Metrics - GET /api/admin/ai-training/metrics
const metricsRes = await fetch('http://localhost:3001/api/admin/ai-training/metrics', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { total_questions, avg_accuracy, top_intents, feedback_trend_7days } = await metricsRes.json();
```

---

## 16. Admin - Chat Console

```typescript
// Danh sách hội thoại - GET /api/admin/conversations
const params = new URLSearchParams({
  page: '1', limit: '20',
  status: 'open',    // open | waiting | bot | closed
  priority: 'urgent', // urgent | high | normal
  assigned_to: 'staff-uuid',
  search: 'nguyen van',
});
const res = await fetch(`http://localhost:3001/api/admin/conversations?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { conversations, pagination } = await res.json();

// Chi tiết - GET /api/admin/conversations/:id
const detailRes = await fetch(`http://localhost:3001/api/admin/conversations/${conversationId}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { conversation, messages, customer_orders, internal_notes } = await detailRes.json();

// Gửi tin nhắn staff - POST /api/admin/conversations/:id/messages
await fetch(`http://localhost:3001/api/admin/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ text: 'Dạ, đơn hàng của bạn đang được xử lý...' }),
});

// Cập nhật hội thoại - PATCH /api/admin/conversations/:id
await fetch(`http://localhost:3001/api/admin/conversations/${conversationId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    assigned_to: 'staff-uuid',
    priority: 'urgent',
    status: 'open',
    tags: ['vip', 'complaint'],
    internal_notes: 'Khách VIP, ưu tiên xử lý',
  }),
});

// Danh sách staff - GET /api/staff
const staffRes = await fetch('http://localhost:3001/api/staff', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const staff = await staffRes.json();
// [{ user_id, full_name, role, avatar_url, is_online }]

// Quick replies - GET /api/admin/quick-replies
const repliesRes = await fetch('http://localhost:3001/api/admin/quick-replies', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const quickReplies = await repliesRes.json();
```

---

## 17. Status Options (Admin filter dropdowns)

```typescript
// GET /api/orders/status-options
const res = await fetch('http://localhost:3001/api/orders/status-options');
const { statuses } = await res.json();
// [{ value: 'pending', label: 'Chờ xác nhận', color: 'amber' }, ...]
// FE dùng để render dropdown filter trong admin order list
```

---

## 18. Tổng hợp - Service Pattern (React/Next.js)

```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:3001/api';
const token = () => localStorage.getItem('token');

const apiClient = {
  get: async (url: string, params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}${url}${query}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  post: async (url: string, body: any) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  put: async (url: string, body: any) => { /* ... */ },
  patch: async (url: string, body: any) => { /* ... */ },
  delete: async (url: string) => { /* ... */ },
};

const authHeaders = () => {
  const t = token();
  return t ? { 'Authorization': `Bearer ${t}` } : {};
};

// Ví dụ sử dụng
const { products } = await apiClient.get('/products', { page: 1, limit: 20 });
const cart = await apiClient.post('/cart', { product_id: '...', quantity: 1 });
const order = await apiClient.post('/orders', { ...checkoutData });
const profile = await apiClient.get('/profile');
```

---

## 19. Xử lý lỗi

```typescript
const res = await fetch('http://localhost:3001/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` },
});

if (res.status === 401) {
  // Token hết hạn hoặc không hợp lệ → redirect login
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
}

if (res.status === 403) {
  // Không có quyền truy cập
  alert('Bạn không có quyền truy cập trang này');
}

if (!res.ok) {
  const err = await res.json();
  alert(err.error || 'Đã xảy ra lỗi');
}
```

---

## 20. Role Navigation (sau login)

```typescript
const handleLoginSuccess = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  switch (data.user.role) {
    case 'admin':
      router.push('/admin');
      break;
    case 'staff':
      router.push('/staff');
      break;
    default:
      router.push('/account');
  }
};
```

---

## 21. Admin - Quản lý Khách hàng

```typescript
// Danh sách - GET /api/admin/customers
const params = new URLSearchParams({
  page: '1', limit: '20',
  search: 'nguyen van',
  status: 'active',   // active | banned
  role: 'customer',    // customer | staff | admin
});
const res = await fetch(`http://localhost:3001/api/admin/customers?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { data: customers, pagination } = await res.json();
// FE hiển thị bảng: avatar, tên, email, số đơn, tổng chi tiêu, trạng thái

// Chi tiết - GET /api/admin/customers/:id
const detailRes = await fetch(`http://localhost:3001/api/admin/customers/${customerId}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const customer = await detailRes.json();
// { orders, reviews, addresses, profile }

// Ban/Unban - PATCH /api/admin/customers/:id
await fetch(`http://localhost:3001/api/admin/customers/${customerId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ status: 'banned' }), // hoặc 'active'
});
```

---

## 22. Admin - Quản lý Banner

```typescript
// Danh sách - GET /api/admin/banners
const params = new URLSearchParams({
  page: '1', limit: '20',
  search: 'sale',
  status: 'active',   // active | inactive | scheduled | expired
  position: 'main',
});
const res = await fetch(`http://localhost:3001/api/admin/banners?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
const { data: banners, pagination } = await res.json();

// Tạo - POST /api/admin/banners
// NOTE: upload ảnh lên Cloudinary/S3 trước, gửi URL lên đây
await fetch('http://localhost:3001/api/admin/banners', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'Flash Sale Mùa Hè',
    image_url: 'https://cdn.example.com/banner.jpg',
    mobile_image_url: 'https://cdn.example.com/banner-mobile.jpg',
    link: 'https://example.com/flash-sale',
    position: 'main',
    start_date: '2024-06-01T00:00:00Z',
    end_date: '2024-08-31T23:59:59Z',
    sort_order: 1,
  }),
});

// Cập nhật - PUT /api/admin/banners/:id
await fetch(`http://localhost:3001/api/admin/banners/${bannerId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ ...updates }),
});

// Toggle - PATCH /api/admin/banners/:id/toggle
await fetch(`http://localhost:3001/api/admin/banners/${bannerId}/toggle`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Xóa - DELETE /api/admin/banners/:id
await fetch(`http://localhost:3001/api/admin/banners/${bannerId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
});
```
