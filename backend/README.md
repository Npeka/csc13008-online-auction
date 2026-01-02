# 🚀 Online Auction Platform - Backend

NestJS backend for Online Auction Platform with PostgreSQL and Prisma ORM.

## 🏗️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm (recommended) or npm

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your configurations:

```bash
cp .env.example .env
```

**Required configurations:**

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- Email settings (SMTP)
- Cloudinary settings (for image upload)

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Push schema to database
pnpm prisma:push

# Seed database with sample data
pnpm prisma:seed

# Or setup everything at once
pnpm db:setup
```

### 4. Start Development Server

```bash
pnpm start:dev
```

The API will be available at: `http://localhost:3001/api/v1`

## 🗄️ Database

### View Database

```bash
pnpm prisma:studio
```

### Reset Database

```bash
pnpm prisma:reset
```

### Create Migration

```bash
pnpm prisma:migrate
```

## 🔑 Default Users (After Seeding)

### Admin Account

- **Email**: `admin@auction.com`
- **Password**: `admin123456`

### Test Sellers

- **Email**: `seller1@test.com` / `seller2@test.com`
- **Password**: `password123`

### Test Bidders

- **Email**: `bidder1@test.com` / `bidder2@test.com` / `bidder3@test.com`
- **Password**: `password123`

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh tokens
- `GET /api/v1/auth/me` - Get current user profile
- `PATCH /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Categories

- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `GET /api/v1/categories/slug/:slug` - Get category by slug
- `POST /api/v1/categories` - Create category (Admin only)
- `PATCH /api/v1/categories/:id` - Update category (Admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

## 🛡️ Security Features

### Authentication & Authorization

- JWT tokens with refresh mechanism
- Role-based access control (Guest, Bidder, Seller, Admin)
- Password hashing with bcrypt (12 rounds)
- Protected routes with guards

### Rate Limiting

- Global rate limiting with multiple tiers
- Special limits for auth endpoints
- Configurable through environment variables

### Data Validation

- Request validation with class-validator
- Input sanitization
- Type safety with TypeScript

### Error Handling

- Global exception filter
- Prisma error handling
- Structured error responses
- No sensitive data exposure

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start:prod
```

### Environment Variables for Production

Make sure to set secure values for:

- `JWT_SECRET` - Strong random string
- `JWT_REFRESH_SECRET` - Different strong random string
- `DATABASE_URL` - Production database URL
- Email and Cloudinary credentials
- `NODE_ENV=production`

## 📊 Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards
│   ├── interfaces/        # TypeScript interfaces
│   └── pipes/             # Validation pipes
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   ├── categories/       # Category management
│   ├── products/         # Product management (TODO)
│   ├── bids/             # Bidding system (TODO)
│   └── users/            # User management (TODO)
├── prisma/               # Database layer
│   └── prisma.service.ts # Prisma service
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## 📝 Development Notes

### Phase 1 ✅ Completed

- [x] Project setup with NestJS + Prisma
- [x] Database schema design
- [x] Authentication system (register, login, JWT)
- [x] Category management API
- [x] Error handling & validation
- [x] Rate limiting & security
- [x] Seed data with sample products

### Next Steps (Phase 2)

- [ ] Products module (CRUD, search, filtering)
- [ ] Bidding system
- [ ] User management & profiles
- [ ] File upload service
- [ ] Email notification service

## 🐛 Troubleshooting

### Database Connection Issues

1. Check if PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Ensure database exists

### Prisma Issues

```bash
# Reset Prisma client
pnpm prisma:generate
```

### Port Already in Use

Change PORT in .env file or kill existing process:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

## 📞 Support

For issues or questions:

1. Check existing GitHub issues
2. Create new issue with details
3. Include error logs and environment info

---

**Happy Coding! 🎉**
