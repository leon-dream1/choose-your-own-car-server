---

## API Endpoints

### Auth

| Method | Endpoint                      | Access | Description                      |
| ------ | ----------------------------- | ------ | -------------------------------- |
| POST   | `/api/auth/register`          | Public | Register with email verification |
| GET    | `/api/auth/verify`            | Public | Verify email via token           |
| POST   | `/api/auth/login`             | Public | Login, returns access token      |
| POST   | `/api/auth/refresh-token`     | Public | Get new access token             |
| POST   | `/api/auth/logout`            | Auth   | Logout current session           |
| POST   | `/api/auth/forgot-password`   | Public | Send reset email                 |
| POST   | `/api/auth/reset-password`    | Public | Reset password                   |
| GET    | `/api/auth/me`                | Auth   | Get own profile                  |
| PATCH  | `/api/auth/me`                | Auth   | Update own profile               |
| POST   | `/api/auth/wishlist/:carId`   | Auth   | Toggle car in wishlist           |
| GET    | `/api/auth/wishlist`          | Auth   | Get wishlist                     |
| GET    | `/api/auth/users`             | Admin  | Get all users                    |
| PATCH  | `/api/auth/users/:id/block`   | Admin  | Block / unblock user             |
| DELETE | `/api/auth/users/:id`         | Admin  | Delete user                      |
| PATCH  | `/api/auth/update-role/:id`   | Admin  | Change user role                 |

### Cars

| Method | Endpoint                    | Access       | Description                                  |
| ------ | --------------------------- | ------------ | -------------------------------------------- |
| GET    | `/api/cars`                 | Public       | Get approved cars (search, filter, paginate) |
| GET    | `/api/cars/:id`             | Public       | Get single car                               |
| GET    | `/api/cars/featured`        | Public       | Get featured cars                            |
| GET    | `/api/cars/my-cars`         | Seller       | Get own listings                             |
| GET    | `/api/cars/pending`         | Admin        | Get pending listings                         |
| POST   | `/api/cars`                 | Seller       | Create listing with images                   |
| PATCH  | `/api/cars/:id`             | Seller/Admin | Update listing + image management            |
| DELETE | `/api/cars/:id`             | Seller/Admin | Delete listing + Cloudinary cleanup          |
| PATCH  | `/api/cars/:id/status`      | Admin        | Approve or reject listing                    |
| PATCH  | `/api/cars/:id/featured`    | Admin        | Toggle featured status                       |

### Orders & Payment

| Method | Endpoint                                   | Access       | Description                        |
| ------ | ------------------------------------------ | ------------ | ---------------------------------- |
| POST   | `/api/orders`                              | User/Seller  | Create booking request             |
| GET    | `/api/orders`                              | Auth         | Get own orders                     |
| GET    | `/api/orders/:id`                          | Auth         | Get single order                   |
| PATCH  | `/api/orders/:id/respond`                  | Seller       | Accept or reject booking           |
| PATCH  | `/api/orders/:id/cancel`                   | Buyer        | Cancel order                       |
| POST   | `/api/orders/:id/payment`                  | Buyer        | Initiate SSLCommerz payment        |
| POST   | `/api/orders/payment/success`              | SSLCommerz   | Payment success webhook            |
| POST   | `/api/orders/payment/fail`                 | SSLCommerz   | Payment fail webhook               |
| POST   | `/api/orders/payment/cancel`               | SSLCommerz   | Payment cancel webhook             |
| GET    | `/api/orders/payment/verify/:transactionId`| Auth         | Verify payment by transaction ID   |
| GET    | `/api/orders/admin/all`                    | Admin        | Get all orders                     |

### Conversations

| Method | Endpoint                              | Access      | Description               |
| ------ | ------------------------------------- | ----------- | ------------------------- |
| POST   | `/api/conversations/start`            | User/Seller | Start or get conversation |
| GET    | `/api/conversations`                  | Auth        | Get all conversations     |
| GET    | `/api/conversations/:id/messages`     | Auth        | Get messages              |
| GET    | `/api/conversations/unread-count`     | Auth        | Get unread count          |
| PATCH  | `/api/conversations/:id/messages/read`| Auth        | Mark all as read          |
| DELETE | `/api/conversations/:id`              | Auth        | Delete conversation       |

### Socket Events

| Event               | Direction       | Description        |
| ------------------- | --------------- | ------------------ |
| `join:conversation` | Client → Server | Join a chat room   |
| `send:message`      | Client → Server | Send a message     |
| `receive:message`   | Server → Client | Receive a message  |
| `typing:start`      | Client → Server | Started typing     |
| `typing:stop`       | Client → Server | Stopped typing     |
| `joined:conversation`| Server → Client | Room join confirm  |
| `offer:responded`   | Server → Client | Offer response     |

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=mongodb+srv://...

# JWT
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_REDIS_HOST=...
UPSTASH_REDIS_PORT=6379
UPSTASH_REDIS_PASSWORD=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Payment
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...
SSLCOMMERZ_IS_LIVE=false

# Client
CLIENT_URL=http://localhost:3000
SERVER_URL=https://choose-your-own-car-server.onrender.com
BCRYPT_SALT_ROUNDS=12
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod
```

---

## Architecture Highlights

- **Modular Pattern** — each feature is a self-contained module
- **Redis as cache + rate limiter + OTP store** — reduces MongoDB load significantly
- **BullMQ queue** — email and write operations never block the request lifecycle
- **Cache invalidation strategy** — pattern-based Redis key deletion on mutations
- **MongoDB Transaction** — atomic multi-collection updates for payment flow
- **Ownership checks** — sellers can only modify their own listings
- **Security by default** — Helmet, CORS, blocked/unverified users rejected at middleware level
- **Graceful shutdown** — ongoing requests complete before server stops
- **Write queue** — heavy DB writes offloaded to background worker
