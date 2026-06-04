# VietShop E-Commerce Backend API Documentation

**Base URL:** `http://localhost:3001`
**All endpoints prefixed with** `/api/`

---

## Authentication

### 1.1. Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "token": "jwt_token_string",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "user | admin | staff",
    "avatar_url": "https://..."
  }
}

Error 401: { "error": "Invalid credentials" }
Error 400: { "error": "Email and password are required" }
```

### 1.2. Đăng ký
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "email": "user@example.com",       // required, unique
  "password": "password123",          // required, min 8 chars
  "full_name": "Nguyễn Văn A",      // required
  "phone": "0901234567",             // optional
  "avatar_url": "https://..."        // optional
}

Response 201: (same as login)
{
  "token": "jwt_token_string",
  "user": { ... }
}

Error 409: { "error": "Email already exists" }
Error 400: { "error": "Password must be at least 8 characters" }
```

---

## Sản phẩm

### 2.1. Danh sách sản phẩm
```
GET /api/products

Query params:
  page          number   (default: 1)
  limit         number   (default: 20)
  category_id   string   (uuid)
  brand_id      string   (uuid)
  featured      boolean  (true)
  best_seller   boolean  (true)
  new_arrival   boolean  (true)
  q             string   (search term - tìm theo tên, mô tả)
  sort          string   (newest | price_asc | price_desc | sold)

Response 200:
{
  "products": [Product],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2.2. Chi tiết sản phẩm
```
GET /api/products/:id

Response 200:
{
  "product_id": "uuid",
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",
  "sku": "IPP15PM-256",
  "short_description": "...",
  "description": "...",
  "price": 34990000,
  "compare_price": 39990000,
  "status": "published",
  "featured": true,
  "best_seller": true,
  "new_arrival": false,
  "view_count": 1240,
  "cost_price": 25000000,
  "weight": 0.221,
  "dimensions": "159.9 x 76.7 x 8.3 mm",
  "meta_title": "...",
  "meta_description": "...",
  "meta_keywords": "...",
  "published_at": "2024-01-15T10:00:00Z",
  "categories": [
    { "category_id": "uuid", "name": "iPhone", "slug": "iphone" }
  ],
  "brands": [
    { "brand_id": "uuid", "name": "Apple", "slug": "apple", "logo_url": "https://..." }
  ],
  "product_images": [
    {
      "image_id": "uuid",
      "image_url": "https://...",
      "alt_text": "iPhone 15 Pro Max",
      "display_order": 1,
      "is_primary": true
    }
  ],
  "product_variants": [
    {
      "variant_id": "uuid",
      "sku": "IPP15PM-256-BLK",
      "name": "256GB - Titan Đen",
      "option1_name": "Dung lượng",
      "option1_value": "256GB",
      "option2_name": "Màu sắc",
      "option2_value": "Titan Đen",
      "price": 34990000,
      "compare_price": 39990000,
      "cost_price": 25000000,
      "stock_quantity": 50,
      "image_url": "https://...",
      "is_active": true
    }
  ],
  "product_reviews": [Review]
}

Error 404: { "error": "Product not found" }
```

### 2.3. Danh mục
```
GET /api/categories

Response 200:
[
  { "category_id": "uuid", "name": "iPhone", "slug": "iphone" },
  { "category_id": "uuid", "name": "Laptop", "slug": "laptop" }
]
```

### 2.4. Thương hiệu
```
GET /api/products/brands

Response 200:
[
  { "brand_id": "uuid", "name": "Apple", "slug": "apple", "logo_url": "https://..." },
  { "brand_id": "uuid", "name": "Samsung", "slug": "samsung", "logo_url": "https://..." }
]
```

---

## Đánh giá sản phẩm (Reviews)

### 2.5. Lấy đánh giá
```
GET /api/products/:id/reviews

Response 200:
[
  {
    "review_id": "uuid",
    "product_id": "uuid",
    "user_id": "uuid",
    "order_id": "uuid | null",
    "rating": 5,
    "title": "Sản phẩm tuyệt vời",
    "comment": "...",
    "images": ["https://..."],
    "is_verified_purchase": true,
    "is_approved": true,
    "helpful_count": 12,
    "created_at": "2024-01-15T10:30:00Z",
    "users": {
      "user_id": "uuid",
      "full_name": "Nguyễn Văn A",
      "avatar_url": "https://..."
    }
  }
]
```

### 2.6. Thêm đánh giá
```
POST /api/products/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "rating": 5,              // 1-5, required
  "title": "Tieu de danh gia",  // optional
  "comment": "Noi dung",    // optional
  "images": ["url1", "url2"], // optional, URL array
  "order_id": "uuid"        // optional, để đánh dấu verified purchase
}

Response 201: (created review object)
Error 404: { "error": "Product not found" }
```

### 2.7. Đánh dấu hữu ích
```
POST /api/products/:id/reviews/:reviewId/helpful
Authorization: Bearer <token>

Response 200: (updated review)
```

---

## Giỏ hàng

### 3.1. Lấy giỏ hàng
```
GET /api/cart
Authorization: Bearer <token>

Response 200:
{
  "cart_id": "uuid",
  "user_id": "uuid",
  "session_id": null,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "cart_items": [
    {
      "cart_item_id": "uuid",
      "cart_id": "uuid",
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": 2,
      "price": 34990000,
      "created_at": "...",
      "updated_at": "...",
      "products": {
        "product_id": "uuid",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max",
        "price": 34990000,
        "compare_price": 39990000,
        "product_images": [
          { "image_id": "uuid", "image_url": "https://...", "is_primary": true }
        ]
      },
      "product_variants": {
        "variant_id": "uuid",
        "name": "256GB - Titan Đen",
        "price": 34990000,
        "compare_price": 39990000,
        "stock_quantity": 50
      }
    }
  ]
}
```

### 3.2. Thêm vào giỏ hàng
```
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "product_id": "uuid",
  "variant_id": "uuid",   // optional - nếu sản phẩm có biến thể
  "quantity": 1
}

Response 200: (full cart sau khi thêm)
```

### 3.3. Cập nhật số lượng
```
PUT /api/cart/:cartItemId
Authorization: Bearer <token>
Content-Type: application/json

Body: { "quantity": 3 }

Response 200: (full cart)
```

### 3.4. Xóa sản phẩm khỏi giỏ hàng
```
DELETE /api/cart/:cartItemId
Authorization: Bearer <token>

Response 200: (full cart)
```

### 3.5. Xóa toàn bộ giỏ hàng
```
DELETE /api/cart
Authorization: Bearer <token>

Response 200: (empty cart)
```

---

## Đơn hàng

### 4.1. Đặt hàng
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "customer_name": "Nguyễn Văn A",
  "customer_email": "user@example.com",
  "customer_phone": "0901234567",
  "shipping_address_line1": "123 Nguyễn Trãi",
  "shipping_address_line2": "...",
  "shipping_city": "TP HCM",
  "shipping_district": "Quận 1",
  "shipping_ward": "Phường Bến Nghé",
  "shipping_postal_code": "700000",
  "shipping_country": "Vietnam",
  "billing_address_line1": "123 Nguyễn Trãi",
  "billing_address_line2": null,
  "billing_city": "TP HCM",
  "billing_district": "Quận 1",
  "billing_ward": "Phường Bến Nghé",
  "billing_postal_code": "700000",
  "billing_country": "Vietnam",
  "payment_method": "cod",     // cod | bank_transfer | momo | vnpay
  "shipping_method": "standard", // standard | express
  "coupon_code": "SALE10",
  "notes": "Giao giờ hành chính"
}

Response 201:
{
  "order_id": "uuid",
  "order_number": "ORD-1705312345678-123",
  ...Order object
}
```

### 4.2. Mua ngay
```
POST /api/orders/buy-now
Authorization: Bearer <token>
Content-Type: application/json

Body: (giống placeOrder + thêm)
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "quantity": 1,
  ...các field address/payment như placeOrder
}

Response 201: (Order object)
```

### 4.3. Danh sách đơn hàng (user)
```
GET /api/orders
Authorization: Bearer <token>

Query:
  page     number (default: 1)
  limit    number (default: 10)
  status   string (pending | processing | shipped | delivered | cancelled)

Response 200:
{
  "orders": [Order],
  "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

### 4.4. Chi tiết đơn hàng
```
GET /api/orders/:orderId
Authorization: Bearer <token>

Response 200: (Order object - full detail)
Error 404: { "error": "Order not found" }
```

### 4.5. Hủy đơn hàng
```
POST /api/orders/:orderId/cancel
Authorization: Bearer <token>
Content-Type: application/json

Body: { "reason": "Không muốn nữa" }

Response 200: (updated Order)
Error 400: { "error": "Order cannot be cancelled" }
Error 404: { "error": "Order not found" }
```

### 4.6. Theo dõi đơn hàng
```
GET /api/orders/:orderId/track
Authorization: Bearer <token>

Response 200:
{
  "order_id": "uuid",
  "order_number": "ORD-...",
  "status": "shipped",
  "tracking_number": "GHN123456",
  "timeline": [
    {
      "status": "ordered",
      "label": "Đã đặt hàng",
      "timestamp": "2024-01-15T10:30:00Z",
      "note": null
    },
    {
      "status": "confirmed",
      "label": "Đã xác nhận",
      "timestamp": "2024-01-15T11:00:00Z"
    },
    {
      "status": "shipped",
      "label": "Đã giao cho đơn vị vận chuyển",
      "timestamp": "2024-01-16T08:00:00Z",
      "note": null,
      "tracking_number": "GHN123456"
    }
  ]
}
```

### 4.7. Phương thức vận chuyển
```
GET /api/orders/shipping-methods

Response 200:
{
  "shipping_methods": [
    { "id": "standard", "name": "Standard", "fee": 30000, "estimated_days": "3-5" },
    { "id": "express", "name": "Express", "fee": 50000, "estimated_days": "1-2" }
  ]
}
```

### 4.8. Phương thức thanh toán
```
GET /api/orders/payment-methods

Response 200:
{
  "payment_methods": [
    { "id": "cod", "name": "Cash on Delivery" },
    { "id": "bank_transfer", "name": "Bank Transfer" },
    { "id": "momo", "name": "MoMo" },
    { "id": "vnpay", "name": "VNPay" }
  ]
}
```

### 4.9. Tùy chọn checkout
```
GET /api/orders/checkout-options

Response 200:
{
  "shipping_methods": [...],
  "payment_methods": [...]
}
```

### 4.10. Status options
```
GET /api/orders/status-options

Response 200:
{
  "statuses": [
    { "value": "pending", "label": "Chờ xác nhận", "color": "amber" },
    { "value": "processing", "label": "Đang xử lý", "color": "blue" },
    { "value": "shipped", "label": "Đang giao", "color": "indigo" },
    { "value": "delivered", "label": "Đã giao", "color": "green" },
    { "value": "cancelled", "label": "Đã hủy", "color": "red" }
  ]
}
```

---

## Tài khoản (Profile)

### 5.1. Thông tin profile
```
GET /api/profile
Authorization: Bearer <token>

Response 200:
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "role": "customer",
  "avatar_url": "https://...",
  "status": "active",
  "email_verified": false,
  "last_login": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "user_addresses": [Address]
}
```

### 5.2. Cập nhật profile
```
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "full_name": "Nguyễn Văn B",
  "phone": "0909876543",
  "avatar_url": "https://..."
}

Response 200: (updated profile)
```

### 5.3. Xóa tài khoản
```
DELETE /api/profile
Authorization: Bearer <token>

Response 200: { "message": "Profile deleted successfully" }
```

### 5.4. Đổi mật khẩu
```
PATCH /api/profile/password
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"  // min 8 chars
}

Response 200: { "message": "Password changed successfully" }
Error 400: { "error": "Current password is incorrect" }
```

### 5.5. Thống kê tài khoản
```
GET /api/profile/stats
Authorization: Bearer <token>

Response 200:
{
  "total_orders": 12,
  "pending_orders": 2,
  "total_spent": 125000000,
  "total_reviews": 5
}
```

### 5.6. Danh sách địa chỉ
```
GET /api/profile/addresses
Authorization: Bearer <token>

Response 200:
[
  {
    "address_id": "uuid",
    "user_id": "uuid",
    "address_type": "home",
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address_line1": "123 Nguyễn Trãi",
    "address_line2": null,
    "city": "TP HCM",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "postal_code": "700000",
    "country": "Vietnam",
    "is_default": true,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

### 5.7. Thêm địa chỉ
```
POST /api/profile/addresses
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "address_type": "home",           // home | office
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "address_line1": "123 Nguyễn Trãi",
  "address_line2": null,
  "city": "TP HCM",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "postal_code": "700000",
  "country": "Vietnam",
  "is_default": false
}

Response 201: (created Address)
```

### 5.8. Cập nhật địa chỉ
```
PUT /api/profile/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json

Body: (giống createAddress - các field muốn update)

Response 200: (updated Address)
Error 404: { "error": "Address not found" }
```

### 5.9. Xóa địa chỉ
```
DELETE /api/profile/addresses/:addressId
Authorization: Bearer <token>

Response 200: { "message": "Address deleted successfully" }
Error 404: { "error": "Address not found" }
```

---

## Thông báo

### 6.1. Danh sách thông báo
```
GET /api/notifications
Authorization: Bearer <token>

Query:
  page   number (default: 1)
  limit  number (default: 20)

Response 200:
{
  "notifications": [
    {
      "notification_id": "uuid",
      "user_id": "uuid",
      "type": "order",           // order | promotion | system
      "title": "Đơn hàng đã được giao",
      "message": "Đơn hàng #ORD-... đã được giao thành công",
      "action_url": "/account/orders/...",
      "icon": "package",
      "is_read": false,
      "read_at": null,
      "data": { "order_id": "uuid", "order_number": "ORD-..." },
      "created_at": "2024-01-15T14:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

### 6.2. Đánh dấu đã đọc
```
PATCH /api/notifications/:id/read
Authorization: Bearer <token>

Response 200: (updated notification)
```

### 6.3. Đánh dấu tất cả đã đọc
```
PATCH /api/notifications/read-all
Authorization: Bearer <token>

Response 200: { "message": "All notifications marked as read" }
```

### 6.4. Số thông báo chưa đọc
```
GET /api/notifications/unread-count
Authorization: Bearer <token>

Response 200: { "count": 3 }
```

---

## Yêu thích (Wishlist)

### 7.1. Lấy danh sách yêu thích
```
GET /api/wishlist
Authorization: Bearer <token>

Response 200:
{
  "wishlist_id": "uuid",
  "user_id": "uuid",
  "items": [
    {
      "wishlist_item_id": "uuid",
      "product_id": "uuid",
      "variant_id": "uuid | null",
      "created_at": "2024-01-15T10:00:00Z",
      "products": {
        "product_id": "uuid",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max",
        "price": 34990000,
        "compare_price": 39990000,
        "status": "published",
        "product_images": [{ "image_url": "https://...", "is_primary": true }],
        "product_variants": [{ "variant_id": "uuid", "name": "...", "price": 34990000 }]
      },
      "product_variants": {
        "variant_id": "uuid",
        "name": "256GB - Titan Đen",
        "price": 34990000,
        "stock_quantity": 50
      }
    }
  ]
}
```

### 7.2. Thêm vào yêu thích
```
POST /api/wishlist
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "product_id": "uuid",
  "variant_id": "uuid"   // optional
}

Response 200: (full wishlist)
Error 404: { "error": "Product not found" }
```

### 7.3. Xóa khỏi yêu thích
```
DELETE /api/wishlist/:productId
Authorization: Bearer <token>

Response 200: (full wishlist)
```

---

## Khuyến mãi (Coupons)

### 8.1. Áp dụng mã giảm giá
```
POST /api/coupons/validate
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "coupon_code": "SALE10",
  "cart_total": 100000000
}

Response 200:
{
  "valid": true,
  "coupon_code": "SALE10",
  "discount_type": "percentage",  // percentage | fixed
  "discount_value": 10,
  "min_order_amount": 50000000,
  "max_discount": 5000000,
  "discount_amount": 10000000,
  "message": "Mã giảm giá hợp lệ"
}

Response 200 (invalid):
{
  "valid": false,
  "coupon_code": "SALE10",
  "message": "Mã giảm giá đã hết hạn"
}
```

### 8.2. Danh sách coupon của user
```
GET /api/coupons
Authorization: Bearer <token>

Response 200:
[
  {
    "user_coupon_id": "uuid",
    "coupon_id": "uuid",
    "code": "SALE10",
    "title": "Giảm 10%",
    "description": "Giảm 10% cho đơn từ 500k",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_order_amount": 500000,
    "max_discount": 500000,
    "expires_at": "2024-12-31T23:59:59Z",
    "is_used": false,
    "is_expired": false
  }
]
```

---

## AI Chatbot

### 9.1. Gửi tin nhắn
```
POST /api/chat
Authorization: Bearer <token>   // optional - guest cũng chat được
Content-Type: application/json

Body:
{
  "message": "Cho tôi hỏi về iPhone 15",
  "session_id": "uuid",         // để maintain context, bỏ qua để tạo session mới
  "context": {
    "last_order_id": "uuid | null",
    "last_product_id": "uuid | null",
    "intent": "product_inquiry | null"
  }
}

Response 200:
{
  "reply": "Dạ, iPhone 15 Pro Max hiện đang có giá ...",
  "session_id": "uuid",
  "intent": "product_inquiry",
  "confidence": 0.85,
  "suggestions": ["Xem iPhone 15", "Kiểm tra đơn hàng", "Liên hệ hỗ trợ"],
  "handoff": false,
  "data": null
}
```

### 9.2. Lịch sử chat
```
GET /api/chat/history?session_id=uuid&limit=50
Authorization: Bearer <token>   // optional

Response 200:
[
  {
    "message_id": "uuid",
    "conversation_id": "uuid",
    "sender_type": "user | bot | staff",
    "sender_id": "uuid | null",
    "sender_name": "Nguyễn Văn A",
    "content": "Cho tôi hỏi về iPhone 15",
    "intent": "product_inquiry",
    "created_at": "2024-01-15T10:30:00Z"
  }
]

Error 400: { "error": "session_id is required" }
```

---

## ADMIN - Dashboard

### 10.1. Thống kê Dashboard
```
GET /api/admin/dashboard
Authorization: Bearer <token> (role: admin)

Response 200:
{
  "kpis": {
    "today_revenue": 45000000,
    "revenue_change_percent": 12.5,
    "new_orders_today": 15,
    "orders_change_percent": 8.3,
    "total_users": 1250,
    "users_change_percent": 5.2,
    "open_chats": 3,
    "chats_change_percent": -20
  },
  "revenue_7days": [
    { "day": "2024-01-09", "revenue": 38000000 },
    { "day": "2024-01-10", "revenue": 42000000 }
  ],
  "order_status_breakdown": [
    { "status": "delivered", "count": 245 },
    { "status": "shipped", "count": 67 },
    { "status": "processing", "count": 43 },
    { "status": "pending", "count": 28 },
    { "status": "cancelled", "count": 12 }
  ],
  "recent_orders": [Order],      // 5 đơn mới nhất
  "open_conversations": [
    {
      "conversation_id": "uuid",
      "customer": { "user_id": "uuid", "full_name": "...", "email": "..." },
      "status": "active",
      "priority": "normal",
      "last_message_at": "2024-01-15T14:00:00Z"
    }
  ]
}
```

---

## ADMIN - Quản lý Đơn hàng

### 11.1. Danh sách đơn hàng (admin)
```
GET /api/admin/orders
Authorization: Bearer <token> (role: admin | staff)

Query:
  page           number
  limit          number
  status         string   (pending | processing | shipped | delivered | cancelled)
  search         string   (tìm theo order_number, customer_name)
  date_from      string   (ISO date)
  date_to        string   (ISO date)
  payment_status string   (paid | unpaid | refunded)

Response 200:
{
  "orders": [Order],
  "pagination": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

### 11.2. Cập nhật đơn hàng
```
PATCH /api/admin/orders/:orderId
Authorization: Bearer <token> (role: admin | staff)
Content-Type: application/json

Body (all fields optional):
{
  "status": "processing",      // pending | processing | shipped | delivered | cancelled
  "payment_status": "paid",   // unpaid | paid | refunded
  "shipping_status": "shipped", // not_shipped | shipped | delivered
  "tracking_number": "GHN123456",
  "internal_notes": "Giao giờ hành chính",
  "shipped_at": "2024-01-16T08:00:00Z",
  "delivered_at": "2024-01-17T14:00:00Z"
}

Response 200: (updated Order)
Error 404: { "error": "Order not found" }
```

### 11.3. Export đơn hàng
```
GET /api/admin/orders/export
Authorization: Bearer <token> (role: admin | staff)
Query: (giống danh sách đơn hàng)

Response 200: JSON array các orders
```

---

## ADMIN - Quản lý Sản phẩm

### 12.1. Tạo sản phẩm
```
POST /api/admin/products
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "name": "iPhone 15 Pro Max",
  "slug": "iphone-15-pro-max",         // optional, auto-generated
  "sku": "IPP15PM-256",
  "short_description": "...",
  "description": "...",
  "price": 34990000,
  "compare_price": 39990000,
  "cost_price": 25000000,
  "category_id": "uuid",
  "brand_id": "uuid",
  "status": "draft",                   // draft | published | out_of_stock
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "weight": 0.221,
  "dimensions": "159.9 x 76.7 x 8.3 mm",
  "meta_title": "...",
  "meta_description": "...",
  "meta_keywords": "...",
  "published_at": "2024-01-15T10:00:00Z"
}

Response 201: (created product)
```

### 12.2. Cập nhật sản phẩm
```
PUT /api/admin/products/:id
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body: (giống create - các field muốn update)

Response 200: (updated product)
Error 404: { "error": "Product not found" }
```

### 12.3. Xóa sản phẩm
```
DELETE /api/admin/products/:id
Authorization: Bearer <token> (role: admin)

Response 200: { "message": "Product deleted successfully" }
Error 404: { "error": "Product not found" }
```

### 12.4. Upload ảnh sản phẩm
```
POST /api/admin/products/:id/images
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "image_url": "https://cdn.example.com/iphone15.jpg",
  "alt_text": "iPhone 15 Pro Max",
  "display_order": 1
}

Response 201:
{
  "image_id": "uuid",
  "image_url": "https://cdn.example.com/iphone15.jpg",
  "alt_text": "iPhone 15 Pro Max",
  "display_order": 1,
  "is_primary": false
}
```

### 12.5. Xóa ảnh sản phẩm
```
DELETE /api/admin/products/:id/images/:imageId
Authorization: Bearer <token> (role: admin)

Response 200: { "message": "Image deleted successfully" }
```

### 12.6. Tạo biến thể
```
POST /api/admin/products/:id/variants
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "sku": "IPP15PM-256-BLK",
  "name": "256GB - Titan Đen",
  "option1_name": "Dung lượng",
  "option1_value": "256GB",
  "option2_name": "Màu sắc",
  "option2_value": "Titan Đen",
  "price": 34990000,
  "compare_price": 39990000,
  "cost_price": 25000000,
  "stock_quantity": 50,
  "image_url": "https://..."
}

Response 201: (created variant)
```

### 12.7. Cập nhật biến thể
```
PUT /api/admin/products/:id/variants/:variantId
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body: (giống create - các field muốn update)

Response 200: (updated variant)
```

---

## ADMIN - AI Training Data

### 13.1. Danh sách Q&A
```
GET /api/admin/ai-training
Authorization: Bearer <token> (role: admin)

Query:
  page        number
  limit       number
  category    string   ("Thông tin sản phẩm" | "FAQ" | "Chính sách" | "Hướng dẫn")
  search      string
  active_only boolean  (true | false)

Response 200:
{
  "data": [
    {
      "training_id": "uuid",
      "category": "FAQ",
      "question": "Chính sách đổi trả như thế nào?",
      "answer": "Bạn có thể hoàn trả trong vòng 7 ngày...",
      "keywords": ["đổi trả", "hoàn", "trả lại"],
      "intent": "return_policy",
      "is_active": true,
      "usage_count": 45,
      "positive_feedback": 40,
      "negative_feedback": 5,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### 13.2. Tạo Q&A
```
POST /api/admin/ai-training
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "category": "FAQ",
  "question": "Chính sách đổi trả như thế nào?",
  "answer": "Bạn có thể hoàn trả trong vòng 7 ngày...",
  "keywords": ["đổi trả", "hoàn", "trả lại"],
  "intent": "return_policy",
  "is_active": true
}

Response 201: (created Q&A record)
```

### 13.3. Cập nhật Q&A
```
PUT /api/admin/ai-training/:id
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body: (giống create - các field muốn update)

Response 200: (updated Q&A record)
```

### 13.4. Xóa Q&A
```
DELETE /api/admin/ai-training/:id
Authorization: Bearer <token> (role: admin)

Response 200: { "message": "Q&A record deleted successfully" }
```

### 13.5. Import CSV
```
POST /api/admin/ai-training/import
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "records": [
    {
      "category": "FAQ",
      "question": "Câu hỏi",
      "answer": "Câu trả lời",
      "keywords": ["keyword1", "keyword2"],
      "intent": "general",
      "is_active": true
    }
  ]
}

Response 200:
{
  "imported": 45,
  "errors": ["Error message 1", "Error message 2"]
}
```

### 13.6. Export CSV
```
GET /api/admin/ai-training/export
Authorization: Bearer <token> (role: admin)

Response 200: JSON array all Q&A records
```

### 13.7. AI Performance Metrics
```
GET /api/admin/ai-training/metrics
Authorization: Bearer <token> (role: admin)

Response 200:
{
  "total_questions": 5000,
  "avg_accuracy": 87.5,
  "top_intents": [
    { "intent": "product_inquiry", "count": 1200 },
    { "intent": "order_inquiry", "count": 800 }
  ],
  "low_confidence_logs": [
    {
      "question": "Câu hỏi khó hiểu",
      "predicted_intent": "general",
      "confidence_score": 0.25,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "feedback_trend_7days": [
    { "day": "2024-01-09", "positive": 45, "negative": 3 },
    { "day": "2024-01-10", "positive": 52, "negative": 2 }
  ]
}
```

---

## ADMIN - Chat Console

### 14.1. Danh sách hội thoại
```
GET /api/admin/conversations
Authorization: Bearer <token> (role: admin | staff)

Query:
  page        number
  limit       number
  status      string   (open | waiting | bot | closed)
  priority    string   (urgent | high | normal)
  assigned_to string   (staff_id)
  search      string

Response 200:
{
  "conversations": [
    {
      "conversation_id": "uuid",
      "customer": {
        "user_id": "uuid",
        "full_name": "Nguyễn Văn A",
        "email": "user@example.com",
        "phone": "0901234567",
        "avatar_url": "https://..."
      },
      "status": "open",          // open | waiting | bot | closed
      "priority": "normal",      // urgent | high | normal
      "assigned_to": "uuid",
      "assigned_staff_name": "Nguyễn Staff B",
      "last_message": "Tôi muốn hỏi về đơn hàng",
      "last_message_at": "2024-01-15T14:00:00Z",
      "unread_count": 2,
      "intent": "order_inquiry",
      "tags": ["urgent", "vip"],
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

### 14.2. Chi tiết hội thoại
```
GET /api/admin/conversations/:id
Authorization: Bearer <token> (role: admin | staff)

Response 200:
{
  "conversation": { ...Conversation object... },
  "messages": [
    {
      "message_id": "uuid",
      "conversation_id": "uuid",
      "sender_type": "user | bot | staff",
      "sender_id": "uuid | null",
      "sender_name": "Nguyễn Văn A",
      "text": "Tôi muốn hỏi về đơn hàng",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "customer_orders": [Order],     // đơn hàng gần đây của khách
  "internal_notes": null
}
```

### 14.3. Gửi tin nhắn (staff)
```
POST /api/admin/conversations/:id/messages
Authorization: Bearer <token> (role: admin | staff)
Content-Type: application/json

Body: { "text": "Dạ, đơn hàng của bạn đang được xử lý..." }

Response 201: (created message)
```

### 14.4. Cập nhật hội thoại
```
PATCH /api/admin/conversations/:id
Authorization: Bearer <token> (role: admin | staff)
Content-Type: application/json

Body:
{
  "assigned_to": "uuid | null",    // gán staff (null = unassign)
  "priority": "urgent",            // urgent | high | normal
  "status": "open",                // open | waiting | closed
  "tags": ["vip", "complaint"],
  "internal_notes": "Khách hàng VIP, ưu tiên xử lý"
}

Response 200: (updated conversation)
```

### 14.5. Danh sách nhân viên
```
GET /api/staff
Authorization: Bearer <token> (role: admin | staff)

Response 200:
[
  {
    "user_id": "uuid",
    "full_name": "Nguyễn Staff B",
    "role": "staff",
    "avatar_url": "https://...",
    "is_online": true    // true nếu last_login < 5 phút
  }
]
```

### 14.6. Quick replies mẫu
```
GET /api/admin/quick-replies
Authorization: Bearer <token> (role: admin | staff)

Response 200:
[
  { "reply_id": "uuid", "title": "Chào khách", "message": "Xin chào, mình có thể giúp gì cho bạn?", "category": "greeting" },
  { "reply_id": "uuid", "title": "Cảm ơn", "message": "Cảm ơn bạn đã liên hệ. Chúc bạn một ngày tốt lành!", "category": "closing" }
]
```

---

## ADMIN - Quản lý Reviews

### 15.1. Danh sách reviews
```
GET /api/admin/reviews
Authorization: Bearer <token> (role: admin | staff)

Query:
  page     number
  limit    number
  search   string   (tìm theo title, comment)
  approved boolean  (true = đã duyệt, false = chờ duyệt, undefined = tất cả)

Response 200:
{
  "data": [
    {
      "review_id": "uuid",
      "product_name": "iPhone 15 Pro Max",
      "product_image": "https://...",
      "user_name": "Nguyễn Văn A",
      "user_avatar": "https://...",
      "rating": 5,
      "title": "Sản phẩm tuyệt vời",
      "comment": "Rất hài lòng với sản phẩm...",
      "is_verified_purchase": true,
      "is_approved": false,
      "helpful_count": 12,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

### 15.2. Duyệt review
```
PATCH /api/admin/reviews/:id/approve
Authorization: Bearer <token> (role: admin | staff)

Response 200: (updated review)
```

### 15.3. Từ chối review
```
PATCH /api/admin/reviews/:id/reject
Authorization: Bearer <token> (role: admin | staff)

Response 200: (updated review)
```

### 15.4. Xóa review
```
DELETE /api/admin/reviews/:id
Authorization: Bearer <token> (role: admin | staff)

Response 200: { "message": "Review deleted successfully" }
```

---

## ADMIN - Quản lý Khuyến mãi

### 16.1. Danh sách coupon
```
GET /api/admin/coupons
Authorization: Bearer <token> (role: admin)

Query:
  page       number
  limit      number
  search     string   (tìm theo code, description)
  status     string   (active | scheduled | expired | disabled)
  is_active  boolean

Response 200:
{
  "data": [
    {
      "coupon_id": "uuid",
      "code": "SUMMER2024",
      "title": "Khuyến mãi mùa hè",
      "discount_type": "percentage",
      "discount_value": 10,
      "min_order_amount": 500000,
      "max_discount": 500000,
      "usage_limit": 1000,
      "used_count": 250,
      "start_date": "2024-06-01T00:00:00Z",
      "end_date": "2024-08-31T23:59:59Z",
      "status": "active",
      "is_featured": false
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
}
```

### 16.2. Tạo coupon
```
POST /api/admin/coupons
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "code": "SUMMER2024",
  "title": "Khuyến mãi mùa hè",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrder": 500000,
  "maxDiscount": 500000,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z"
}

Response 201: (created coupon)
Error 409: { "error": "Mã giảm giá đã tồn tại" }
```

### 16.3. Cập nhật coupon
```
PUT /api/admin/coupons/:id
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body: (giống create - các field muốn update)

Response 200: (updated coupon)
Error 404: { "error": "Coupon not found" }
```

### 16.4. Xóa coupon
```
DELETE /api/admin/coupons/:id
Authorization: Bearer <token> (role: admin)

Response 200: { "message": "Coupon deleted successfully" }
Error 404: { "error": "Coupon not found" }
```

### 16.5. Toggle trạng thái coupon
```
PATCH /api/admin/coupons/:id/toggle
Authorization: Bearer <token> (role: admin)

Response 200: (updated coupon)
Error 404: { "error": "Coupon not found" }
```

---

## ADMIN - Quản lý Khách hàng

### 17.1. Danh sách khách hàng
```
GET /api/admin/customers
Authorization: Bearer <token> (role: admin)

Query:
  page       number
  limit      number
  search     string   (tìm theo full_name, email, phone)
  status     string   (active | banned)
  is_active  boolean
  role       string   (customer | staff | admin)

Response 200:
{
  "data": [
    {
      "user_id": "uuid",
      "full_name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0901234567",
      "avatar_url": "https://...",
      "role": "customer",
      "total_orders": 12,
      "total_spent": 125000000,
      "last_order_at": "2024-01-15T10:00:00Z",
      "total_reviews": 5,
      "email_verified": true,
      "last_login": "2024-01-15T09:00:00Z",
      "joined_at": "2024-01-01T00:00:00Z",
      "status": "active"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### 17.2. Chi tiết khách hàng
```
GET /api/admin/customers/:id
Authorization: Bearer <token> (role: admin)

Response 200:
{
  "user_id": "uuid",
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0901234567",
  "avatar_url": "https://...",
  "role": "customer",
  "email_verified": true,
  "last_login": "2024-01-15T09:00:00Z",
  "joined_at": "2024-01-01T00:00:00Z",
  "status": "active",
  "orders": [
    { "order_id": "uuid", "order_number": "ORD-...", "total_amount": 5000000, "status": "delivered", "created_at": "..." }
  ],
  "reviews": [
    { "review_id": "uuid", "product_name": "iPhone 15", "rating": 5, "comment": "...", "created_at": "..." }
  ],
  "addresses": [{ "address_id": "uuid", "full_name": "...", "phone": "...", "address_line1": "...", "city": "...", "district": "...", "is_default": true }]
}
Error 404: { "error": "User not found" }
```

### 17.3. Cập nhật trạng thái khách hàng (ban/unban)
```
PATCH /api/admin/customers/:id
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body: { "status": "banned" | "active" }

Response 200: { "user_id": "uuid", "full_name": "...", "email": "...", "status": "banned" }
Error 404: { "error": "User not found" }
```

---

## ADMIN - Quản lý Banner

### 18.1. Danh sách banner
```
GET /api/admin/banners
Authorization: Bearer <token> (role: admin)

Query:
  page      number
  limit     number
  search    string   (tìm theo title)
  status    string   (active | inactive | scheduled | expired)
  position  string

Response 200:
{
  "data": [
    {
      "banner_id": "uuid",
      "title": "Flash Sale Mùa Hè",
      "image_url": "https://...",
      "mobile_image_url": "https://...",
      "link": "https://...",
      "position": "main",
      "device": "all",
      "status": "active",
      "start_date": "2024-06-01T00:00:00Z",
      "end_date": "2024-08-31T23:59:59Z",
      "sort_order": 1,
      "click_count": 1250,
      "is_active": true
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```

### 18.2. Tạo banner
```
POST /api/admin/banners
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body:
{
  "title": "Flash Sale Mùa Hè",
  "image_url": "https://cdn.example.com/banner.jpg",
  "mobile_image_url": "https://cdn.example.com/banner-mobile.jpg",
  "link": "https://example.com/flash-sale",
  "position": "main",
  "device": "all",
  "start_date": "2024-06-01T00:00:00Z",
  "end_date": "2024-08-31T23:59:59Z",
  "sort_order": 1
}

Response 201: (created banner)
```

### 18.3. Cập nhật banner
```
PUT /api/admin/banners/:id
Authorization: Bearer <token> (role: admin)
Content-Type: application/json

Body: (giống create - các field muốn update)

Response 200: (updated banner)
Error 404: { "error": "Banner not found" }
```

### 18.4. Xóa banner
```
DELETE /api/admin/banners/:id
Authorization: Bearer <token> (role: admin)

Response 200: { "message": "Banner deleted successfully" }
Error 404: { "error": "Banner not found" }
```

### 18.5. Toggle trạng thái banner
```
PATCH /api/admin/banners/:id/toggle
Authorization: Bearer <token> (role: admin)

Response 200: (updated banner)
Error 404: { "error": "Banner not found" }
```

---

## Error Response Format
```json
{
  "error": "Error message"
}
```

## Auth Header
```
Authorization: Bearer <jwt_token>
```

## Role-based Access
| Role | Access |
|------|--------|
| `customer` | `/api/profile/*`, `/api/cart/*`, `/api/orders/*`, `/api/wishlist/*`, `/api/notifications/*`, `/api/coupons/*`, `/api/chat` |
| `staff` | + `/api/admin/orders/*`, `/api/admin/conversations/*`, `/api/staff` |
| `admin` | + all admin endpoints |

## Mapping trạng thái

```typescript
// Order status
const ORDER_STATUS = {
  pending:    "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped:    "Đang giao",
  delivered:  "Đã giao",
  cancelled:  "Đã hủy",
};

// Order payment_status
const PAYMENT_STATUS = {
  pending: "Chưa thanh toán",
  paid:    "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

// Order shipping_status
const SHIPPING_STATUS = {
  not_shipped: "Chưa giao",
  shipped:     "Đã giao",
  delivered:   "Đã nhận",
};

// Product status
const PRODUCT_STATUS = {
  draft:       "Nháp",
  published:   "Đang bán",
  out_of_stock: "Hết hàng",
};

// Chat conversation status
const CHAT_STATUS = {
  open:    "Đang mở",
  waiting: "Chờ phản hồi",
  bot:     "Bot đang xử lý",
  closed:  "Đã đóng",
};

// Chat priority
const CHAT_PRIORITY = {
  urgent: "Khẩn cấp",
  high:   "Cao",
  normal: "Bình thường",
};
```
