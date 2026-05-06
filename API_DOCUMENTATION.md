# API Documentation

Base URL: `http://localhost:3000`

## Authentication

### Login
Đăng nhập vào hệ thống và nhận JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid-string",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "0123456789",
    "role": "customer",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Email hoặc password bị thiếu
```json
{
  "error": "Email and password are required"
}
```
- `401 Unauthorized`: Email hoặc password không đúng
```json
{
  "error": "Invalid credentials"
}
```

---

## Products

### Get Product List
Lấy danh sách sản phẩm với bộ lọc và phân trang.

**Endpoint:** `GET /api/products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | string | No | Lọc theo category ID |
| brand_id | string | No | Lọc theo brand ID |
| featured | boolean | No | Lọc sản phẩm nổi bật (true/false) |
| best_seller | boolean | No | Lọc sản phẩm bán chạy (true/false) |
| new_arrival | boolean | No | Lọc sản phẩm mới (true/false) |
| page | number | No | Số trang (mặc định: 1) |
| limit | number | No | Số item mỗi trang (mặc định: 20) |

**Example Request:**
```
GET /api/products?category_id=cat-123&featured=true&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "product_id": "uuid-string",
      "name": "Product Name",
      "slug": "product-name",
      "sku": "SKU-123",
      "short_description": "Short description",
      "description": "Full description",
      "price": 100000,
      "compare_price": 150000,
      "status": "published",
      "featured": true,
      "best_seller": false,
      "new_arrival": true,
      "view_count": 100,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "categories": {
        "category_id": "uuid-string",
        "name": "Category Name",
        "slug": "category-slug"
      },
      "brands": {
        "brand_id": "uuid-string",
        "name": "Brand Name",
        "slug": "brand-slug"
      },
      "product_images": [
        {
          "image_id": "uuid-string",
          "image_url": "https://example.com/image.jpg",
          "alt_text": "Product image",
          "display_order": 0,
          "is_primary": true
        }
      ],
      "product_variants": [
        {
          "variant_id": "uuid-string",
          "name": "Size M - Red",
          "price": 100000,
          "compare_price": 150000,
          "stock_quantity": 50
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### Get Product Details
Lấy chi tiết sản phẩm theo ID.

**Endpoint:** `GET /api/products/:id`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Product ID |

**Example Request:**
```
GET /api/products/uuid-string
```

**Response (200 OK):**
```json
{
  "product_id": "uuid-string",
  "name": "Product Name",
  "slug": "product-name",
  "sku": "SKU-123",
  "short_description": "Short description",
  "description": "Full description",
  "price": 100000,
  "compare_price": 150000,
  "cost_price": 80000,
  "status": "published",
  "featured": true,
  "best_seller": false,
  "new_arrival": true,
  "weight": 1.5,
  "dimensions": "10x20x30",
  "meta_title": "Meta Title",
  "meta_description": "Meta Description",
  "meta_keywords": "keyword1, keyword2",
  "view_count": 100,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "published_at": "2024-01-01T00:00:00Z",
  "categories": {
    "category_id": "uuid-string",
    "name": "Category Name",
    "slug": "category-slug"
  },
  "brands": {
    "brand_id": "uuid-string",
    "name": "Brand Name",
    "slug": "brand-slug",
    "logo_url": "https://example.com/logo.jpg"
  },
  "product_images": [
    {
      "image_id": "uuid-string",
      "image_url": "https://example.com/image1.jpg",
      "alt_text": "Product image 1",
      "display_order": 0,
      "is_primary": true
    },
    {
      "image_id": "uuid-string",
      "image_url": "https://example.com/image2.jpg",
      "alt_text": "Product image 2",
      "display_order": 1,
      "is_primary": false
    }
  ],
  "product_variants": [
    {
      "variant_id": "uuid-string",
      "product_id": "uuid-string",
      "sku": "SKU-123-M-RED",
      "name": "Size M - Red",
      "option1_name": "Size",
      "option1_value": "M",
      "option2_name": "Color",
      "option2_value": "Red",
      "price": 100000,
      "compare_price": 150000,
      "cost_price": 80000,
      "stock_quantity": 50,
      "image_url": "https://example.com/variant.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "product_reviews": [
    {
      "review_id": "uuid-string",
      "product_id": "uuid-string",
      "user_id": "uuid-string",
      "order_id": "uuid-string",
      "rating": 5,
      "title": "Great product!",
      "comment": "I really love this product",
      "images": ["https://example.com/review1.jpg"],
      "is_verified_purchase": true,
      "is_approved": true,
      "helpful_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "users": {
        "user_id": "uuid-string",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

**Error Response:**
- `404 Not Found`: Sản phẩm không tồn tại
```json
{
  "error": "Product not found"
}
```

---

## Cart

> **Note:** Tất cả API Cart yêu cầu authentication token trong header.

### Add to Cart
Thêm sản phẩm vào giỏ hàng.

**Endpoint:** `POST /api/cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": "uuid-string",
  "variant_id": "uuid-string (optional)",
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "cart_id": "uuid-string",
  "user_id": "uuid-string",
  "session_id": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "cart_items": [
    {
      "cart_item_id": "uuid-string",
      "cart_id": "uuid-string",
      "product_id": "uuid-string",
      "variant_id": "uuid-string",
      "quantity": 2,
      "price": 100000,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "products": {
        "product_id": "uuid-string",
        "name": "Product Name",
        "slug": "product-name",
        "price": 100000,
        "compare_price": 150000,
        "product_images": [
          {
            "image_id": "uuid-string",
            "image_url": "https://example.com/image.jpg",
            "alt_text": "Product image",
            "display_order": 0,
            "is_primary": true
          }
        ]
      },
      "product_variants": {
        "variant_id": "uuid-string",
        "name": "Size M - Red",
        "price": 100000,
        "compare_price": 150000,
        "stock_quantity": 50
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Thiếu thông tin bắt buộc
```json
{
  "error": "Product ID and quantity are required"
}
```
- `404 Not Found`: Sản phẩm hoặc variant không tồn tại
```json
{
  "error": "Product not found"
}
```
- `401 Unauthorized`: Token không hợp lệ hoặc thiếu

---

### Get Cart
Lấy giỏ hàng của user hiện tại.

**Endpoint:** `GET /api/cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "cart_id": "uuid-string",
  "user_id": "uuid-string",
  "session_id": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "cart_items": [
    {
      "cart_item_id": "uuid-string",
      "cart_id": "uuid-string",
      "product_id": "uuid-string",
      "variant_id": "uuid-string",
      "quantity": 2,
      "price": 100000,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "products": {
        "product_id": "uuid-string",
        "name": "Product Name",
        "slug": "product-name",
        "price": 100000,
        "compare_price": 150000,
        "product_images": [
          {
            "image_id": "uuid-string",
            "image_url": "https://example.com/image.jpg",
            "alt_text": "Product image",
            "display_order": 0,
            "is_primary": true
          }
        ]
      },
      "product_variants": {
        "variant_id": "uuid-string",
        "name": "Size M - Red",
        "price": 100000,
        "compare_price": 150000,
        "stock_quantity": 50
      }
    }
  ]
}
```

**Response (200 OK) - Empty Cart:**
```json
{
  "cart_id": null,
  "cart_items": []
}
```

---

## Orders

> **Note:** Tất cả API Orders yêu cầu authentication token trong header.

### Place Order
Đặt hàng từ giỏ hàng hiện tại.

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "0123456789",
  "shipping_address_line1": "123 Street",
  "shipping_address_line2": "Apartment 4B",
  "shipping_city": "Ho Chi Minh City",
  "shipping_district": "District 1",
  "shipping_ward": "Ward 1",
  "shipping_postal_code": "700000",
  "shipping_country": "Vietnam",
  "billing_address_line1": "123 Street",
  "billing_address_line2": "Apartment 4B",
  "billing_city": "Ho Chi Minh City",
  "billing_district": "District 1",
  "billing_ward": "Ward 1",
  "billing_postal_code": "700000",
  "billing_country": "Vietnam",
  "payment_method": "cod",
  "shipping_method": "standard",
  "coupon_code": "SAVE10",
  "notes": "Please deliver between 9AM-5PM"
}
```

**Required Fields:**
- `customer_name`
- `customer_email`
- `shipping_address_line1`
- `shipping_city`

**Optional Fields:**
- `customer_phone`
- `shipping_address_line2`
- `shipping_district`
- `shipping_ward`
- `shipping_postal_code`
- `shipping_country` (mặc định: "Vietnam")
- `billing_address_line1` (mặc định: dùng shipping address)
- `billing_address_line2`
- `billing_city`
- `billing_district`
- `billing_ward`
- `billing_postal_code`
- `billing_country`
- `payment_method`
- `shipping_method`
- `coupon_code`
- `notes`

**Response (201 Created):**
```json
{
  "order_id": "uuid-string",
  "order_number": "ORD-1704067200000-123",
  "user_id": "uuid-string",
  "status": "pending",
  "payment_status": "pending",
  "shipping_status": "pending",
  "customer_email": "john@example.com",
  "customer_phone": "0123456789",
  "customer_name": "John Doe",
  "shipping_address_line1": "123 Street",
  "shipping_address_line2": "Apartment 4B",
  "shipping_city": "Ho Chi Minh City",
  "shipping_district": "District 1",
  "shipping_ward": "Ward 1",
  "shipping_postal_code": "700000",
  "shipping_country": "Vietnam",
  "billing_address_line1": "123 Street",
  "billing_address_line2": "Apartment 4B",
  "billing_city": "Ho Chi Minh City",
  "billing_district": "District 1",
  "billing_ward": "Ward 1",
  "billing_postal_code": "700000",
  "billing_country": "Vietnam",
  "subtotal": 200000,
  "shipping_fee": 30000,
  "tax_amount": 0,
  "discount_amount": 20000,
  "total_amount": 210000,
  "coupon_code": "SAVE10",
  "payment_method": "cod",
  "shipping_method": "standard",
  "notes": "Please deliver between 9AM-5PM",
  "internal_notes": null,
  "tracking_number": null,
  "shipped_at": null,
  "delivered_at": null,
  "cancelled_at": null,
  "cancellation_reason": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "order_items": [
    {
      "order_item_id": "uuid-string",
      "order_id": "uuid-string",
      "product_id": "uuid-string",
      "variant_id": "uuid-string",
      "product_name": "Product Name",
      "variant_name": "Size M - Red",
      "sku": "SKU-123-M-RED",
      "quantity": 2,
      "unit_price": 100000,
      "total_price": 200000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Thiếu thông tin bắt buộc hoặc giỏ hàng trống
```json
{
  "error": "Required fields are missing"
}
```
```json
{
  "error": "Cart is empty"
}
```
- `401 Unauthorized`: Token không hợp lệ hoặc thiếu

---

### Get Orders
Lấy danh sách đơn hàng của user hiện tại.

**Endpoint:** `GET /api/orders`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Số trang (mặc định: 1) |
| limit | number | No | Số item mỗi trang (mặc định: 10) |

**Example Request:**
```
GET /api/orders?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "orders": [
    {
      "order_id": "uuid-string",
      "order_number": "ORD-1704067200000-123",
      "user_id": "uuid-string",
      "status": "pending",
      "payment_status": "pending",
      "shipping_status": "pending",
      "customer_email": "john@example.com",
      "customer_phone": "0123456789",
      "customer_name": "John Doe",
      "shipping_address_line1": "123 Street",
      "shipping_address_line2": "Apartment 4B",
      "shipping_city": "Ho Chi Minh City",
      "shipping_district": "District 1",
      "shipping_ward": "Ward 1",
      "shipping_postal_code": "700000",
      "shipping_country": "Vietnam",
      "subtotal": 200000,
      "shipping_fee": 30000,
      "tax_amount": 0,
      "discount_amount": 20000,
      "total_amount": 210000,
      "coupon_code": "SAVE10",
      "payment_method": "cod",
      "shipping_method": "standard",
      "notes": "Please deliver between 9AM-5PM",
      "tracking_number": null,
      "shipped_at": null,
      "delivered_at": null,
      "cancelled_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "order_items": [
        {
          "order_item_id": "uuid-string",
          "order_id": "uuid-string",
          "product_id": "uuid-string",
          "variant_id": "uuid-string",
          "product_name": "Product Name",
          "variant_name": "Size M - Red",
          "sku": "SKU-123-M-RED",
          "quantity": 2,
          "unit_price": 100000,
          "total_price": 200000,
          "created_at": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## Common Error Responses

### 401 Unauthorized
Token không hợp lệ hoặc thiếu authentication.
```json
{
  "error": "Authentication required"
}
```
hoặc
```json
{
  "error": "Invalid token"
}
```

### 500 Internal Server Error
Lỗi server.
```json
{
  "error": "Internal server error"
}
```

---

## Authentication Flow

1. **Login**: Gọi `POST /api/auth/login` với email và password
2. **Receive Token**: Nhận JWT token trong response
3. **Use Token**: Thêm token vào header cho các request cần authentication:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

---

## Notes

- Tất cả giá trị tiền tệ (price, total_amount, etc.) đều ở dạng số (number)
- Tất cả datetime đều theo format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- Product ID và các ID khác đều là UUID string
- Sau khi đặt hàng thành công, giỏ hàng sẽ tự động được xóa
- Stock quantity sẽ được tự động trừ sau khi đặt hàng
- Coupon code sẽ được kiểm tra tính hợp lệ trước khi áp dụng
