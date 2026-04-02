# Choose Your own Car — Car Marketplace API

A production-ready RESTful API for a car buying and selling marketplace, built with scalability and security in mind.

🚀 [Live URL](#) | [GitHub Repository](https://github.com/leon-dream1/choose-your-own-car-server)

---

## Features

### Authentication & Security

- JWT-based authentication with **Access Token** (15min) + **Refresh Token** (30 days)
- **Email verification** on registration via OTP stored in Redis (10min TTL)
- **Forgot Password** flow with Redis-based reset tokens (15min TTL)
- **Role-based access control** (RBAC) — `user`, `seller`, `admin`
- **Rate limiting** with Redis — Register: 5/min, Login: 10/15min
- Password hashing with **Bcrypt**
- **HttpOnly cookie** for refresh token storage

### Car Listings

- Sellers can create, update, and delete listings
- **Multiple image upload** via Cloudinary (max 5 images, 2MB each)
- Auto image optimization (width limit, quality auto, WebP/AVIF conversion)
- **Cover image** auto-set from first uploaded image
- Admin approval workflow (`pending` → `approved` / `rejected`)
- Cloudinary cleanup on listing deletion or image replacement
- **Search, Filter & Pagination** — by brand, condition, price range, keyword

### Performance & Scalability

- **Redis caching** for car listings — 15x faster repeated queries
- Cache invalidation on create, update, approve, delete
- **BullMQ email queue** — background email processing with retry (3 attempts, exponential backoff)
- MongoDB indexes on frequently queried fields
- `.lean()` queries for read-only operations

### Real-time Chat

- **WebSocket** (Socket.io) — Buyer ↔ Seller real-time messaging
- Room-based architecture — one room per conversation
- Typing indicators
- Unread message count
- JWT authentication on socket connection

---

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Runtime        | Node.js, TypeScript     |
| Framework      | Express.js              |
| Database       | MongoDB, Mongoose       |
| Cache / Queue  | Redis (Upstash), BullMQ |
| Authentication | JWT, Bcrypt             |
| Validation     | Zod                     |
| File Upload    | Multer, Cloudinary      |
| Real-time      | Socket.io               |
| Email          | Nodemailer, BullMQ      |

---

## Project Structure

```
src/
├── app/
│   ├── config/           # DB, Redis, Cloudinary config
│   ├── errors/           # AppError class
│   ├── middlewares/      # auth, validateRequest, rateLimiter, multer
│   ├── modules/
│   │   ├── user/         # register, login, forgot password, RBAC
│   │   ├── car/          # listings, image upload, search, cache
│   │   └── conversation/ # chat, messages, unread count
│   ├── queues/           # BullMQ email queue
│   ├── socket/           # Socket.io setup and handlers
│   ├── utils/            # JWT, OTP, cache, Cloudinary, email templates
│   └── workers/          # Email worker
├── app.ts
└── server.ts
```

---

## API Endpoints

### Auth

| Method | Endpoint                    | Access | Description                      |
| ------ | --------------------------- | ------ | -------------------------------- |
| POST   | `/api/auth/register`        | Public | Register with email verification |
| GET    | `/api/auth/verify`          | Public | Verify email via token           |
| POST   | `/api/auth/login`           | Public | Login, returns access token      |
| POST   | `/api/auth/refresh-token`   | Public | Get new access token             |
| POST   | `/api/auth/logout`          | Auth   | Logout current session           |
| POST   | `/api/auth/forgot-password` | Public | Send reset email                 |
| POST   | `/api/auth/reset-password`  | Public | Reset password                   |
| PATCH  | `/api/auth/update-role/:id` | Admin  | Change user role                 |

### Cars

| Method | Endpoint               | Access       | Description                                  |
| ------ | ---------------------- | ------------ | -------------------------------------------- |
| GET    | `/api/cars`            | Public       | Get approved cars (search, filter, paginate) |
| GET    | `/api/cars/:id`        | Public       | Get single car                               |
| POST   | `/api/cars`            | Seller       | Create listing with images                   |
| PATCH  | `/api/cars/:id`        | Seller/Admin | Update listing + image management            |
| DELETE | `/api/cars/:id`        | Seller/Admin | Delete listing + Cloudinary cleanup          |
| GET    | `/api/cars/my-cars`    | Seller       | Get own listings                             |
| PATCH  | `/api/cars/:id/status` | Admin        | Approve or reject listing                    |

### Conversations

| Method | Endpoint                          | Access      | Description               |
| ------ | --------------------------------- | ----------- | ------------------------- |
| POST   | `/api/conversations/start`        | User/Seller | Start or get conversation |
| GET    | `/api/conversations`              | Auth        | Get all conversations     |
| GET    | `/api/conversations/:id/messages` | Auth        | Get messages              |
| GET    | `/api/conversations/unread-count` | Auth        | Get unread count          |

### Socket Events

| Event               | Direction       | Description       |
| ------------------- | --------------- | ----------------- |
| `join:conversation` | Client → Server | Join a chat room  |
| `send:message`      | Client → Server | Send a message    |
| `receive:message`   | Server → Client | Receive a message |
| `typing:start`      | Client → Server | Started typing    |
| `typing:stop`       | Client → Server | Stopped typing    |

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

# Client
CLIENT_URL=http://localhost:3000
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
- **Redis as cache + session store** — reduces MongoDB load significantly
- **BullMQ queue** — email never blocks the request lifecycle
- **Cache invalidation strategy** — pattern-based Redis key deletion on mutations
- **Ownership checks** — sellers can only modify their own listings
- **Security by default** — blocked/unverified users rejected at middleware level
