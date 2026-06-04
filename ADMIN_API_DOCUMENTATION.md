# Admin API Documentation

> **Base URL:** `http://localhost:3001/api/admin`
>
> **Authentication:** Bearer token (JWT) trong header `Authorization: Bearer <token>`
>
> **Roles:**
> - `adminOnly` — chỉ tài khoản role `admin`
> - `staffOnly` — tài khoản role `admin` hoặc `staff`

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Orders](#2-orders) — `staffOnly`
3. [Products](#3-products) — `adminOnly`
4. [AI Training](#4-ai-training) — `adminOnly`
5. [Conversations](#5-conversations) — `staffOnly`
6. [Reviews](#6-reviews) — `staffOnly`
7. [Coupons](#7-coupons) — `adminOnly`
8. [Customers](#8-customers) — `adminOnly`
9. [Banners](#9-banners) — `adminOnly`
10. [Categories](#10-categories) — `adminOnly`
11. [Posts](#11-posts) — `adminOnly`
12. [Media Library](#12-media-library) — `adminOnly`
13. [Training Data](#13-training-data) — `adminOnly`
14. [Quick Replies](#14-quick-replies) — `adminOnly`
15. [Staff](#15-staff) — `adminOnly`
16. [Settings](#16-settings) — `adminOnly`
17. [Payments](#17-payments) — `adminOnly`

---

## Common Query Parameters

Cho các endpoint GET list:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Trang hiện tại |
| `limit` | number | `20` | Số item mỗi trang |
| `search` | string | — | Tìm kiếm theo tên/slug/email |
| `status` | string | — | Lọc theo trạng thái (tuỳ module) |
| `category` | string | — | Lọc theo danh mục |
| `payment_method` | string | — | Lọc theo phương thức thanh toán |

---

## Common Response Format

### List Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "error": "Error message here"
}
```

---

## 1. Dashboard

### `GET /dashboard`
Lấy thống kê tổng quan admin.

**Middleware:** `adminOnly`

**Response:**

```json
{
  "data": {
    "todayRevenue": 12500000,
    "todayOrders": 45,
    "totalProducts": 320,
    "totalCustomers": 1850,
    "pendingOrders": 12,
    "lowStockAlerts": 5,
    "recentOrders": [...],
    "topProducts": [...],
    "revenueChart": {
      "labels": ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      "values": [8000000, 12000000, 9500000, 11000000, 15000000, 18000000, 12500000]
    },
    "orderStatusChart": {
      "pending": 12,
      "processing": 8,
      "shipped": 15,
      "delivered": 156,
      "cancelled": 4
    }
  }
}
```

---

## 2. Orders

### `GET /orders`
Danh sách đơn hàng.

**Middleware:** `staffOnly`

**Query params thêm:** `status`, `payment_status`, `shipping_status`, `from_date`, `to_date`

**Response:**

```json
{
  "data": [
    {
      "order_id": "uuid",
      "order_number": "ORD-000001",
      "customer_name": "Nguyễn Văn A",
      "customer_email": "a@example.com",
      "customer_phone": "0909123456",
      "status": "pending",
      "payment_status": "paid",
      "shipping_status": "pending",
      "total_amount": 350000,
      "payment_method": "vnpay",
      "shipping_method": "ghn",
      "created_at": "2026-06-01T10:00:00Z",
      "item_count": 2
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

### `PATCH /orders/:orderId`
Cập nhật trạng thái đơn hàng.

**Middleware:** `staffOnly`

**Body:**

```json
{
  "status": "processing",
  "shipping_status": "shipped",
  "tracking_number": "GHN123456",
  "internal_notes": "Giao nhanh cho khách VIP"
}
```

---

### `GET /orders/export`
Export đơn hàng ra file.

**Middleware:** `staffOnly`

**Query params:** `status`, `from_date`, `to_date`, `format` (`csv` | `xlsx`)

---

### `GET /orders/:orderId/track`
Theo dõi trạng thái vận chuyển.

**Middleware:** `staffOnly`

---

## 3. Products

### `POST /products`
Tạo sản phẩm mới.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "name": "Áo Thun Nam",
  "category_id": "uuid",
  "brand_id": "uuid",
  "price": 199000,
  "compare_price": 299000,
  "cost_price": 120000,
  "short_description": "Áo thun nam chất liệu cotton 100%",
  "description": "<html content>",
  "sku": "TSHIRT-001",
  "status": "draft",
  "weight": 0.3,
  "dimensions": "30x20x5",
  "featured": true,
  "best_seller": false,
  "new_arrival": true,
  "meta_title": "Áo Thun Nam",
  "meta_description": "Mô tả SEO",
  "meta_keywords": "ao, thun, nam"
}
```

---

### `PUT /products/:id`
Cập nhật sản phẩm.

**Middleware:** `adminOnly`

---

### `DELETE /products/:id`
Xóa sản phẩm.

**Middleware:** `adminOnly`

---

### `POST /products/:id/images`
Upload ảnh sản phẩm.

**Middleware:** `adminOnly`

**Body:** `FormData` với field `images` (file ảnh)

---

### `DELETE /products/:id/images/:imageId`
Xóa ảnh sản phẩm.

**Middleware:** `adminOnly`

---

### `POST /products/:id/variants`
Tạo biến thể sản phẩm.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "sku": "TSHIRT-001-RED-M",
  "name": "Áo Thun Đỏ / M",
  "option1_name": "Màu",
  "option1_value": "Đỏ",
  "option2_name": "Size",
  "option2_value": "M",
  "price": 199000,
  "compare_price": 299000,
  "cost_price": 120000,
  "stock_quantity": 50,
  "image_url": "https://..."
}
```

---

### `PUT /products/:id/variants/:variantId`
Cập nhật biến thể.

**Middleware:** `adminOnly`

---

## 4. AI Training

### `GET /ai-training`
Danh sách dữ liệu huấn luyện AI.

**Middleware:** `adminOnly`

**Query params thêm:** `category`, `intent`

---

### `POST /ai-training`
Tạo bản ghi QA.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "question": "Làm sao để đổi trả sản phẩm?",
  "answer": "Quý khách có thể đổi trả trong vòng 7 ngày...",
  "category": "return_policy",
  "intent": "exchange",
  "keywords": ["đổi", "trả", "hoàn tiền", "7 ngày"],
  "context": {}
}
```

---

### `PUT /ai-training/:id`
Cập nhật bản ghi QA.

**Middleware:** `adminOnly`

---

### `DELETE /ai-training/:id`
Xóa bản ghi QA.

**Middleware:** `adminOnly`

---

### `POST /ai-training/import`
Import nhiều bản ghi QA (JSON array).

**Middleware:** `adminOnly`

---

### `GET /ai-training/export`
Export dữ liệu QA ra file.

**Middleware:** `adminOnly`

**Query params:** `format` (`csv` | `json`)

---

### `GET /ai-training/metrics`
Lấy metrics hiệu suất AI.

**Middleware:** `adminOnly`

---

## 5. Conversations

### `GET /conversations`
Danh sách hội thoại hỗ trợ.

**Middleware:** `staffOnly`

**Query params thêm:** `status`, `assigned_to`, `priority`

---

### `GET /conversations/:id`
Chi tiết hội thoại (kèm messages).

**Middleware:** `staffOnly`

---

### `POST /conversations/:id/messages`
Gửi tin nhắn trả lời.

**Middleware:** `staffOnly`

**Body:**

```json
{
  "content": "Cảm ơn bạn đã liên hệ...",
  "message_type": "text"
}
```

---

### `PATCH /conversations/:id`
Cập nhật hội thoại (assign, đổi priority, close).

**Middleware:** `staffOnly`

**Body:**

```json
{
  "status": "closed",
  "assigned_to": "staff-uuid",
  "priority": "high",
  "tags": ["khieu-nai", "qua-han"]
}
```

---

## 6. Reviews

### `GET /reviews`
Danh sách đánh giá sản phẩm.

**Middleware:** `staffOnly`

**Query params thêm:** `approved` (`true` | `false`)

**Response:**

```json
{
  "data": [
    {
      "review_id": "uuid",
      "product_name": "Áo Thun Nam",
      "product_image": "https://...",
      "user_name": "Nguyễn Văn B",
      "user_avatar": "https://...",
      "rating": 5,
      "title": "Sản phẩm tuyệt vời",
      "comment": "Chất lượng rất tốt, giao hàng nhanh...",
      "images": ["https://..."],
      "is_verified_purchase": true,
      "is_approved": false,
      "helpful_count": 12,
      "created_at": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

---

### `PATCH /reviews/:id/approve`
Duyệt đánh giá.

**Middleware:** `staffOnly`

---

### `PATCH /reviews/:id/reject`
Từ chối đánh giá.

**Middleware:** `staffOnly`

---

### `DELETE /reviews/:id`
Xóa đánh giá.

**Middleware:** `staffOnly`

---

## 7. Coupons

### `GET /coupons`
Danh sách mã giảm giá.

**Middleware:** `adminOnly`

**Query params thêm:** `is_active`, `discount_type`

---

### `POST /coupons`
Tạo mã giảm giá.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "code": "SUMMER2026",
  "description": "Giảm 20% cho đơn hàng mùa hè",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_purchase_amount": 200000,
  "max_discount_amount": 100000,
  "usage_limit": 1000,
  "usage_limit_per_user": 1,
  "valid_from": "2026-06-01T00:00:00Z",
  "valid_to": "2026-08-31T23:59:59Z"
}
```

---

### `PUT /coupons/:id`
Cập nhật mã giảm giá.

**Middleware:** `adminOnly`

---

### `DELETE /coupons/:id`
Xóa mã giảm giá.

**Middleware:** `adminOnly`

---

### `PATCH /coupons/:id/toggle`
Bật/tắt trạng thái mã giảm giá.

**Middleware:** `adminOnly`

---

## 8. Customers

### `GET /customers`
Danh sách khách hàng.

**Middleware:** `adminOnly`

**Query params thêm:** `role`, `email_verified`

---

### `GET /customers/:id`
Chi tiết khách hàng.

**Middleware:** `adminOnly`

---

### `PATCH /customers/:id`
Cập nhật trạng thái khách hàng.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "status": "active"
}
```

---

## 9. Banners

### `GET /banners`
Danh sách banner.

**Middleware:** `adminOnly`

**Query params thêm:** `position`, `status` (`active` | `inactive` | `scheduled` | `expired`)

**Response:**

```json
{
  "data": [
    {
      "banner_id": "uuid",
      "title": "Summer Sale 2026",
      "image_url": "https://...",
      "mobile_image_url": "https://...",
      "link": "https://shop.com/summer-sale",
      "position": "main",
      "status": "active",
      "start_date": "2026-06-01T00:00:00Z",
      "end_date": "2026-08-31T23:59:59Z",
      "sort_order": 1,
      "click_count": 1520,
      "is_active": true
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### `POST /banners`
Tạo banner.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "title": "Summer Sale 2026",
  "image_url": "https://...",
  "mobile_image_url": "https://...",
  "link": "https://shop.com/summer-sale",
  "position": "main",
  "start_date": "2026-06-01T00:00:00Z",
  "end_date": "2026-08-31T23:59:59Z",
  "sort_order": 1
}
```

---

### `PUT /banners/:id`
Cập nhật banner.

**Middleware:** `adminOnly`

---

### `DELETE /banners/:id`
Xóa banner.

**Middleware:** `adminOnly`

---

### `PATCH /banners/:id/toggle`
Bật/tắt banner.

**Middleware:** `adminOnly`

---

## 10. Categories

### `GET /categories`
Danh sách danh mục.

**Middleware:** `adminOnly`

**Response:**

```json
{
  "data": [
    {
      "category_id": "uuid",
      "parent_id": "uuid-hoặc-null",
      "name": "Áo Nam",
      "slug": "ao-nam",
      "description": "Các loại áo dành cho nam",
      "image_url": "https://...",
      "icon": "shirt",
      "sort_order": 1,
      "is_active": true,
      "meta_title": "Áo Nam chính hãng",
      "meta_description": "Mua áo nam...",
      "meta_keywords": "ao nam, áo sơ mi, áo thun",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-06-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```

---

### `POST /categories`
Tạo danh mục.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "name": "Áo Nam",
  "parent_id": "uuid-hoặc-null",
  "description": "Các loại áo dành cho nam",
  "image_url": "https://...",
  "icon": "shirt",
  "sort_order": 1,
  "is_active": true,
  "meta_title": "Áo Nam chính hãng",
  "meta_description": "Mua áo nam...",
  "meta_keywords": "ao nam, áo sơ mi, áo thun"
}
```

---

### `PUT /categories/:id`
Cập nhật danh mục.

**Middleware:** `adminOnly`

---

### `DELETE /categories/:id`
Xóa danh mục.

**Middleware:** `adminOnly`

---

## 11. Posts

### `GET /posts`
Danh sách bài viết blog.

**Middleware:** `adminOnly`

**Query params thêm:** `status` (`draft` | `published` | `scheduled`)

**Response:**

```json
{
  "data": [
    {
      "post_id": "uuid",
      "title": "Cách chọn size áo chuẩn",
      "slug": "cach-chon-size-ao-chuan",
      "excerpt": "Hướng dẫn chọn size...",
      "featured_image": "https://...",
      "status": "published",
      "category_name": "Hướng dẫn",
      "author_name": "Admin",
      "view_count": 1520,
      "meta_title": "Cách chọn size áo chuẩn",
      "meta_description": "...",
      "published_at": "2026-06-01T10:00:00Z",
      "created_at": "2026-05-15T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 }
}
```

---

### `GET /posts/:id`
Chi tiết bài viết (kèm content HTML).

**Middleware:** `adminOnly`

---

### `POST /posts`
Tạo bài viết.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "title": "Cách chọn size áo chuẩn",
  "content": "<p>Nội dung HTML...</p>",
  "excerpt": "Hướng dẫn chọn size...",
  "featured_image": "https://...",
  "status": "draft",
  "category_id": "uuid",
  "meta_title": "Cách chọn size áo chuẩn",
  "meta_description": "...",
  "meta_keywords": "size, áo, hướng dẫn",
  "published_at": "2026-06-01T10:00:00Z"
}
```

---

### `PUT /posts/:id`
Cập nhật bài viết.

**Middleware:** `adminOnly`

---

### `DELETE /posts/:id`
Xóa bài viết.

**Middleware:** `adminOnly`

---

## 12. Media Library

### `GET /library`
Danh sách file trong thư viện media.

**Middleware:** `adminOnly`

**Query params thêm:** `file_type` (`image` | `video` | `document`)

**Response:**

```json
{
  "data": [
    {
      "media_id": "uuid",
      "filename": "banner-summer-2026.jpg",
      "original_filename": "banner-summer.jpg",
      "file_path": "/uploads/banner-summer-2026.jpg",
      "file_url": "https://cdn.shop.com/uploads/banner-summer-2026.jpg",
      "file_type": "image",
      "mime_type": "image/jpeg",
      "file_size": 245000,
      "width": 1920,
      "height": 600,
      "alt_text": "Banner Summer Sale 2026",
      "title": "Banner Summer",
      "description": "Banner quảng cáo mùa hè 2026",
      "created_at": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

---

### `PUT /library/:id`
Cập nhật metadata file.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "alt_text": "Banner Summer Sale 2026",
  "title": "Banner Summer",
  "description": "..."
}
```

---

### `DELETE /library/:id`
Xóa file khỏi thư viện.

**Middleware:** `adminOnly`

---

## 13. Training Data

### `GET /training-data`
Danh sách dữ liệu huấn luyện AI.

**Middleware:** `adminOnly`

**Response:**

```json
{
  "data": [
    {
      "training_id": "uuid",
      "category": "return_policy",
      "question": "Làm sao để đổi trả sản phẩm?",
      "answer": "Quý khách có thể đổi trả trong vòng 7 ngày...",
      "keywords": ["đổi", "trả", "hoàn tiền", "7 ngày"],
      "intent": "exchange",
      "context": {},
      "is_active": true,
      "usage_count": 45,
      "positive_feedback": 38,
      "negative_feedback": 2,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-06-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 200, "totalPages": 10 }
}
```

---

### `POST /training-data`
Tạo bản ghi dữ liệu huấn luyện.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "category": "return_policy",
  "question": "Làm sao để đổi trả sản phẩm?",
  "answer": "Quý khách có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem mác...",
  "keywords": ["đổi", "trả", "hoàn tiền", "7 ngày"],
  "intent": "exchange",
  "context": {}
}
```

---

### `PUT /training-data/:id`
Cập nhật bản ghi.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "answer": "Cập nhật câu trả lời mới...",
  "is_active": false
}
```

---

### `DELETE /training-data/:id`
Xóa bản ghi.

**Middleware:** `adminOnly`

---

## 14. Quick Replies

### `GET /quick-replies`
Danh sách trả lời nhanh.

**Middleware:** `adminOnly`

**Query params thêm:** `category`

**Response:**

```json
{
  "data": [
    {
      "reply_id": "uuid",
      "category": "shipping",
      "title": "Thời gian giao hàng",
      "message": "Đơn hàng của bạn sẽ được giao trong 2-5 ngày làm việc...",
      "shortcut": "/ship",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-06-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
}
```

---

### `POST /quick-replies`
Tạo trả lời nhanh.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "category": "shipping",
  "title": "Thời gian giao hàng",
  "message": "Đơn hàng của bạn sẽ được giao trong 2-5 ngày làm việc...",
  "shortcut": "/ship",
  "sort_order": 1
}
```

---

### `PUT /quick-replies/:id`
Cập nhật trả lời nhanh.

**Middleware:** `adminOnly`

---

### `DELETE /quick-replies/:id`
Xóa trả lời nhanh.

**Middleware:** `adminOnly`

---

## 15. Staff

### `GET /staff`
Danh sách nhân viên & admin.

**Middleware:** `adminOnly`

**Query params thêm:** `role`, `status`

**Response:**

```json
{
  "data": [
    {
      "user_id": "uuid",
      "email": "staff@shop.com",
      "full_name": "Trần Văn Staff",
      "phone": "0909123456",
      "avatar_url": "https://...",
      "role": "staff",
      "status": "active",
      "email_verified": true,
      "last_login": "2026-06-01T10:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### `PUT /staff/:id`
Cập nhật trạng thái và/hoặc vai trò nhân viên.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "status": "active",
  "role": "admin"
}
```

---

### `PATCH /staff/:id/status`
Cập nhật trạng thái nhân viên.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "status": "active"
}
```

---

### `PATCH /staff/:id/role`
Cập nhật vai trò nhân viên.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "role": "admin"
}
```

---

## 16. Settings

### `GET /settings`
Danh sách cài đặt hệ thống.

**Middleware:** `adminOnly`

**Query params thêm:** `category` (`general` | `email` | `payment` | `shipping`)

**Response:**

```json
{
  "data": [
    {
      "setting_id": "uuid",
      "category": "general",
      "key": "store_name",
      "value": "My Fashion Shop",
      "data_type": "string",
      "description": "Tên cửa hàng hiển thị",
      "is_public": true,
      "updated_at": "2026-06-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 30, "totalPages": 2 }
}
```

---

### `PUT /settings`
Cập nhật giá trị cài đặt.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "category": "general",
  "key": "store_name",
  "value": "My Fashion Shop mới",
  "description": "Tên cửa hàng"
}
```

---

### `POST /settings`
Tạo hoặc cập nhật cài đặt (upsert).

**Middleware:** `adminOnly`

**Body:**

```json
{
  "category": "general",
  "key": "store_name",
  "value": "My Fashion Shop",
  "data_type": "string",
  "description": "Tên cửa hàng hiển thị",
  "is_public": true
}
```

---

## 17. Payments

### `GET /payments`
Danh sách thanh toán.

**Middleware:** `adminOnly`

**Query params thêm:** `status` (`pending` | `completed` | `failed` | `refunded`), `payment_method`

**Response:**

```json
{
  "data": [
    {
      "payment_id": "uuid",
      "order_id": "uuid",
      "order_number": "ORD-000001",
      "customer_name": "Nguyễn Văn A",
      "customer_email": "a@example.com",
      "payment_method": "vnpay",
      "amount": 350000,
      "status": "completed",
      "transaction_id": "VNP123456789",
      "paid_at": "2026-06-01T10:05:00Z",
      "refunded_at": null,
      "refund_amount": 0,
      "created_at": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 200, "totalPages": 10 }
}
```

---

### `PATCH /payments/:id/refund`
Hoàn tiền thanh toán.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "refund_amount": 350000
}
```

> Nếu không gửi `refund_amount`, hoàn toàn bộ số tiền.

---

### `PATCH /payments/:id/status`
Cập nhật trạng thái thanh toán.

**Middleware:** `adminOnly`

**Body:**

```json
{
  "status": "completed"
}
```

---

## HTTP Status Codes

| Code | Mô tả |
|------|--------|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Request không hợp lệ (thiếu params, sai format ID) |
| `401` | Chưa đăng nhập / token hết hạn |
| `403` | Không có quyền (sai role) |
| `404` | Resource không tồn tại |
| `500` | Lỗi server |

---

## Authentication Flow

1. Gọi `POST /api/auth/login` với email + password
2. Nhận `accessToken` (JWT) trong response
3. Gắn vào header: `Authorization: Bearer <accessToken>`
4. Token có thể hết hạn → gọi `POST /api/auth/refresh` với refreshToken
