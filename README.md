# E-commerce API Backend

API backend for e-commerce application with authentication, product management, cart, and order functionality.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3000
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt-token",
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "customer"
    }
  }
  ```

### Products

#### Get Product List
- **GET** `/api/products`
- **Query Parameters:**
  - `category_id` (optional): Filter by category
  - `brand_id` (optional): Filter by brand
  - `featured` (optional): Filter featured products
  - `best_seller` (optional): Filter best sellers
  - `new_arrival` (optional): Filter new arrivals
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20)
- **Response:**
  ```json
  {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
  ```

#### Get Product Details
- **GET** `/api/products/:id`
- **Response:** Product details with images, variants, and reviews

### Cart (Requires Authentication)

#### Add to Cart
- **POST** `/api/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "product_id": "product-uuid",
    "variant_id": "variant-uuid (optional)",
    "quantity": 2
  }
  ```
- **Response:** Updated cart with items

#### Get Cart
- **GET** `/api/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User's cart with items

### Orders (Requires Authentication)

#### Place Order
- **POST** `/api/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "0123456789",
    "shipping_address_line1": "123 Street",
    "shipping_city": "Ho Chi Minh City",
    "shipping_district": "District 1",
    "shipping_ward": "Ward 1",
    "shipping_postal_code": "700000",
    "payment_method": "cod",
    "shipping_method": "standard",
    "coupon_code": "SAVE10 (optional)",
    "notes": "Optional notes"
  }
  ```
- **Response:** Created order with items

#### Get Orders
- **GET** `/api/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response:** User's orders with pagination

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:
- `users`: User accounts and authentication
- `products`: Product catalog
- `product_variants`: Product variants (size, color, etc.)
- `product_images`: Product images
- `carts`: Shopping carts
- `cart_items`: Items in cart
- `orders`: Customer orders
- `order_items`: Items in orders
- `coupons`: Discount coupons

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes require valid JWT token

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
