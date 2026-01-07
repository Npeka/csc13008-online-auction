# Online Auction Platform

A comprehensive online auction platform built with modern web technologies, featuring real-time bidding, automatic bid extensions, multi-role user management, and advanced auction features.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup Guide](#detailed-setup-guide)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## Tech Stack

### Frontend

- **Framework:** React 19.2.0 with TypeScript 5.9.3
- **Build Tool:** Vite 7.2.5 (Rolldown)
- **Routing:** React Router 7.11.0 (Data API)
- **State Management:** Zustand 5.0.9
- **Data Fetching:** TanStack React Query 5.90.16
- **HTTP Client:** Axios 1.13.2
- **UI Components:** Custom components with Tailwind CSS 4.1.18
- **Icons:** Lucide React 0.562.0
- **Forms:** React Hook Form + Zod validation
- **Rich Text Editor:** React Quill New 3.7.0
- **Notifications:** React Hot Toast 2.6.0
- **Authentication:** Firebase 12.7.0 + JWT
- **CAPTCHA:** React Google reCAPTCHA 3.1.0
- **Storage:** Supabase Storage

### Backend

- **Framework:** NestJS 11.0.1
- **Language:** TypeScript 5.7.3
- **Runtime:** Node.js 18+ (required)
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 6.8.2
- **Caching:** Redis (ioredis 5.5.0) - **Required for OTP caching**
- **Authentication:** JWT + Passport + Firebase Admin 13.6.0
- **Password Hashing:** bcryptjs 3.0.3
- **Rate Limiting:** NestJS Throttler 6.4.0
- **Storage:** Supabase Storage (primary) + Cloudinary 2.8.0 (CDN, optional)
- **Email Service:** Brevo API (@getbrevo/brevo 3.0.1)
- **Email Transport:** Nodemailer 7.0.10
- **File Upload:** Multer 2.0.2
- **Task Scheduling:** NestJS Schedule 6.1.0

## Prerequisites

### Required

- **Node.js:** 18 or higher
- **Package Manager:** pnpm (required, not npm)
- **Database:** PostgreSQL 15 or higher
- **Cache:** Redis (required for OTP caching and sessions)

### Required Services

- **Firebase:** Project setup for OAuth authentication
- **Supabase:** Account for file storage (user avatars, product images)
- **Brevo (formerly Sendinblue):** Account for transactional emails
- **reCAPTCHA:** Google reCAPTCHA v2 for form protection

### Optional

- **Cloudinary:** Account for image CDN and transformations (optional)
- **Docker:** For containerized deployment

## Quick Start

### 1. Install Prerequisites

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version  # Should be 18+
pnpm --version
psql --version  # Should be 15+
redis-cli --version
```

### 2. Clone Repository

```bash
git clone <repository-url>
cd csc13008-online-auction
```

### 3. Setup Database (Option A: Standalone Database Package)

```bash
cd db

# Install dependencies
pnpm install

# Configure database
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Setup database (create tables + seed data)
pnpm db:setup
```

For detailed database setup instructions, see [Database README](./db/README.md).

### 4. Setup Backend

```bash
cd ../backend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configurations (see Environment Variables section)

# Generate Prisma Client
pnpm prisma:generate

# Start development server
pnpm start:dev
```

Backend will run on `http://localhost:3000`

For detailed backend setup, see [Backend README](./backend/README.md).

### 5. Setup Frontend

```bash
cd ../frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with Firebase, reCAPTCHA, and Supabase credentials

# Start development server
pnpm dev
```

Frontend will run on `http://localhost:5173`

For detailed frontend setup, see [Frontend README](./frontend/README.md).

## Detailed Setup Guide

### Step 1: Database Setup

You have two options for setting up the database:

#### Option A: Using Standalone Database Package (Recommended)

The `db` folder is a standalone package that can set up the database independently:

```bash
cd db
pnpm install
cp .env.example .env
# Edit .env with PostgreSQL connection string
pnpm db:setup
```

#### Option B: Using Backend Prisma Commands

```bash
cd backend
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:seed
```

**Database Seed Data includes:**

- Admin account: `admin@auction.com` / `admin123456`
- Test sellers: `seller1@test.com`, `seller2@test.com` / `password123`
- Test bidders: `bidder1@test.com`, `bidder2@test.com`, `bidder3@test.com` / `password123`
- 10+ product categories
- 100+ sample products with images
- Sample bids, ratings, and Q&A data

### Step 2: Backend Configuration

#### Required Environment Variables

Create `backend/.env` from `.env.example` and configure:

```env
# Application
PORT=3000
API_PREFIX="api/v1"
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Database (matches your PostgreSQL setup)
DATABASE_URL="postgresql://auction:auction123@localhost:5432/online_auction?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"

# JWT (generate strong secrets for production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (Brevo API)
BREVO_API_KEY="your-brevo-api-key-here"
BREVO_FROM_EMAIL="noreply@auction.com"
BREVO_FROM_NAME="Online Auction Platform"

# Firebase (download service account JSON from Firebase Console)
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"
```

### Step 3: Frontend Configuration

Create `frontend/.env` from `.env.example` and configure:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1

# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# reCAPTCHA (from Google reCAPTCHA Console)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Supabase Storage (from Supabase Dashboard)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Start All Services

#### Development Mode

```bash
# Terminal 1: PostgreSQL & Redis (if not running)
# Make sure PostgreSQL and Redis are started

# Terminal 2: Backend
cd backend
pnpm start:dev

# Terminal 3: Frontend
cd frontend
pnpm dev
```

#### Using Docker (Alternative)

```bash
cd backend
docker-compose up -d

# Then seed database
pnpm prisma:push
pnpm prisma:seed
```

For Docker setup details, see [Docker Setup Guide](./backend/DOCKER_SETUP.md).

## Project Structure

```
csc13008-online-auction/
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── auth/        # Authentication (JWT, Firebase, Passport)
│   │   ├── users/       # User management & profiles
│   │   ├── products/    # Product CRUD operations
│   │   ├── bids/        # Bidding system & auto-bidding
│   │   ├── categories/  # Category management
│   │   ├── orders/      # Post-auction order processing
│   │   ├── ratings/     # Rating & review system
│   │   ├── questions/   # Product Q&A system
│   │   ├── email/       # Email service (Brevo integration)
│   │   ├── firebase/    # Firebase Admin SDK integration
│   │   ├── redis/       # Redis caching service
│   │   ├── scheduler/   # Background tasks & cron jobs
│   │   ├── system/      # Health checks & system monitoring
│   │   ├── common/      # Shared utilities, guards, decorators
│   │   └── prisma/      # Prisma service
│   ├── prisma/          # Database schema and models
│   │   ├── models/      # Individual model files (17 models)
│   │   ├── schema.prisma # Main schema file
│   │   ├── seed.ts      # Database seeding script
│   │   ├── categories.json # Sample category data
│   │   └── products.json   # Sample product data
│   ├── test/            # E2E test files
│   ├── docker-compose.yml  # Docker Compose configuration
│   ├── Dockerfile       # Docker image definition
│   ├── .env.example     # Environment variables template
│   ├── DOCKER_SETUP.md  # Docker deployment guide
│   └── README.md        # Backend documentation
│
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   ├── cards/  # Product, Category, User cards
│   │   │   ├── layout/ # Header, Footer, Sidebar
│   │   │   ├── shared/ # BidInput, Countdown, etc.
│   │   │   └── ui/     # Base UI primitives (shadcn-style)
│   │   ├── pages/       # Application pages
│   │   │   ├── admin/  # Admin dashboard & management
│   │   │   ├── auth/   # Login, Register, Password reset
│   │   │   ├── home/   # Landing page
│   │   │   ├── products/   # Product listing & details
│   │   │   ├── profile/    # User profile, wallet, watchlist
│   │   │   └── seller/     # Seller dashboard & management
│   │   ├── lib/         # Utilities and API clients
│   │   │   ├── api/    # API modules by domain
│   │   │   └── utils.ts # Helper functions
│   │   ├── stores/      # Zustand global state stores
│   │   ├── types/       # TypeScript type definitions
│   │   ├── hooks/       # Custom React hooks
│   │   ├── routes/      # Route configuration
│   │   ├── data/        # Static data and constants
│   │   └── assets/      # Static assets
│   ├── public/          # Public static files
│   ├── .env.example     # Environment variables template
│   └── README.md        # Frontend documentation
│
├── db/                  # Standalone database setup package
│   ├── prisma/          # Same structure as backend/prisma
│   ├── package.json     # Database setup scripts
│   ├── .env.example     # Database connection template
│   └── README.md        # Database setup guide
│
├── document/            # Project documentation
│
└── README.md            # This file (root documentation)
```

## Key Features

### User Management

- **Multi-role system:** Guest, Bidder, Seller, Admin
- **Authentication:** Email/password + Firebase OAuth (Google, Facebook)
- **Email verification:** OTP-based email verification (Redis-cached)
- **JWT tokens:** Access tokens (15m) + Refresh tokens (7d)
- **Profile management:** Avatar upload, personal information
- **Upgrade system:** Bidders can request upgrade to Seller
- **Password recovery:** Email-based password reset with OTP

### Product & Auction System

- **Product management:** CRUD operations for sellers
- **Category organization:** Hierarchical category system
- **Image upload:** Multiple images per product (Supabase Storage)
- **Rich text descriptions:** WYSIWYG editor for detailed descriptions
- **Auction scheduling:** Schedule auctions with start/end times
- **Auto-extension:** Extend auction by 10 minutes if bid placed in last 5 minutes
- **Full-text search:** Search products by title, description, category
- **Real-time updates:** Auction status updates automatically
- **Product states:** Draft, scheduled, active, ended, cancelled

### Bidding System

- **Real-time bidding:** Place bids on active auctions
- **Auto-bidding:** Set maximum bid amount for automatic bidding
- **Bid validation:** Minimum increment, step price validation
- **Bid history:** Complete bid history per product
- **Email notifications:** Notify on outbid, auction won/lost
- **Bidder blocking:** Sellers can block specific bidders
- **Bid retraction:** Cancel bids under certain conditions

### Order Management

- **Post-auction orders:** Automatic order creation after auction ends
- **Order status tracking:** Pending, paid, shipped, completed, cancelled
- **Payment integration:** Ready for payment gateway integration
- **Order history:** Complete order history for buyers and sellers
- **Order notifications:** Email notifications for order status changes

### Rating & Review System

- **Product ratings:** Rate won products (1-5 stars)
- **Seller ratings:** Rate sellers based on transaction experience
- **Review management:** Detailed reviews with ratings
- **Rating aggregation:** Average ratings displayed on products/sellers
- **Review moderation:** Admin can moderate inappropriate reviews

### Q&A System

- **Product questions:** Bidders can ask questions about products
- **Seller responses:** Sellers can answer questions
- **Question visibility:** Public questions visible to all users
- **Question approval:** Sellers can approve/reject questions
- **Email notifications:** Notify sellers of new questions

### Admin Features

- **User management:** View, edit, suspend user accounts
- **Category management:** CRUD operations for categories
- **Product moderation:** Review and moderate product listings
- **Upgrade requests:** Approve/reject seller upgrade requests
- **System monitoring:** Health checks, system statistics
- **Email logs:** View email sending history
- **Auction events:** Audit trail of auction events

### Additional Features

- **Watchlist:** Save products to watchlist for later
- **Chat messages:** In-app messaging system (ready for implementation)
- **Email logs:** Track all outgoing emails
- **System configuration:** Configurable system settings
- **Background jobs:** Automated tasks (auction closure, notifications)
- **Rate limiting:** API rate limiting to prevent abuse
- **CORS protection:** Secure cross-origin requests
- **Input validation:** Comprehensive input validation with class-validator

## Environment Variables

### Backend Environment Variables

| Variable                        | Description            | Example                                  | Required |
| ------------------------------- | ---------------------- | ---------------------------------------- | -------- |
| `PORT`                          | Backend server port    | 3000                                     | No       |
| `API_PREFIX`                    | API route prefix       | api/v1                                   | No       |
| `NODE_ENV`                      | Environment            | development                              | No       |
| `FRONTEND_URL`                  | Frontend URL for CORS  | http://localhost:5173                    | Yes      |
| `DATABASE_URL`                  | PostgreSQL connection  | postgresql://user:pass@localhost:5432/db | Yes      |
| `DATABASE_HOST`                 | PostgreSQL username    | auction                                  | No       |
| `DATABASE_PASSWORD`             | PostgreSQL password    | auction123                               | No       |
| `DATABASE_DB`                   | Database name          | online_auction                           | No       |
| `DATABASE_PORT`                 | PostgreSQL port        | 5432                                     | No       |
| `JWT_SECRET`                    | Access token secret    | Strong random string                     | Yes      |
| `JWT_EXPIRES_IN`                | Access token lifetime  | 15m                                      | No       |
| `JWT_REFRESH_SECRET`            | Refresh token secret   | Strong random string                     | Yes      |
| `JWT_REFRESH_EXPIRES_IN`        | Refresh token lifetime | 7d                                       | No       |
| `BREVO_API_KEY`                 | Brevo email API key    | API key from Brevo                       | Yes      |
| `BREVO_FROM_EMAIL`              | Sender email           | noreply@auction.com                      | No       |
| `BREVO_FROM_NAME`               | Sender name            | Online Auction Platform                  | No       |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Firebase credentials   | ./firebase-service-account.json          | Yes      |

### Frontend Environment Variables

| Variable                            | Description             | Required |
| ----------------------------------- | ----------------------- | -------- |
| `VITE_API_URL`                      | Backend API URL         | Yes      |
| `VITE_FIREBASE_API_KEY`             | Firebase API key        | Yes      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain    | Yes      |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID     | Yes      |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket | Yes      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID      | Yes      |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID         | Yes      |
| `VITE_RECAPTCHA_SITE_KEY`           | reCAPTCHA site key      | Yes      |
| `VITE_SUPABASE_URL`                 | Supabase project URL    | Yes      |
| `VITE_SUPABASE_ANON_KEY`            | Supabase anon key       | Yes      |

## Development Workflow

### 1. Start PostgreSQL and Redis

Make sure PostgreSQL and Redis are running before starting the backend.

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### 2. Start Backend

```bash
cd backend
pnpm start:dev

# Backend will be available at:
# - API: http://localhost:3000/api/v1
# - Health: http://localhost:3000/api/v1/health
```

### 3. Start Frontend

```bash
cd frontend
pnpm dev

# Frontend will be available at:
# - App: http://localhost:5173
```

### 4. Development Tools

#### Prisma Studio (Database GUI)

```bash
cd backend
pnpm prisma:studio
# Access at: http://localhost:5555
```

#### View Logs

```bash
# Backend logs (if using Docker)
cd backend
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

### 5. Making Changes

- **Backend changes:** Hot reload enabled, server restarts automatically
- **Frontend changes:** Hot module replacement (HMR) enabled
- **Database schema changes:**
  ```bash
  cd backend
  pnpm prisma:generate
  pnpm prisma:push
  ```

## Docker Deployment

### Development with Docker

```bash
cd backend

# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Seed database
pnpm prisma:push
pnpm prisma:seed

# Stop services
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Docker Services

- **PostgreSQL 17 Alpine:** Port 5432
- **Redis Alpine:** Port 6379
- **Backend (NestJS):** Port 3000

For complete Docker setup guide, see [Docker Setup](./backend/DOCKER_SETUP.md).

## Production Deployment

### Backend Production

1. **Configure environment:**

   ```env
   NODE_ENV=production
   DATABASE_URL=<production-postgres-url>
   JWT_SECRET=<strong-secret-256-bits>
   JWT_REFRESH_SECRET=<different-strong-secret>
   BREVO_API_KEY=<production-key>
   FRONTEND_URL=<production-frontend-url>
   ```

2. **Generate secrets:**

   ```bash
   # Generate strong random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Build and deploy:**

   ```bash
   pnpm build
   pnpm start:prod
   ```

4. **Use migrations:**
   ```bash
   # Use migrations instead of push in production
   pnpm prisma:migrate:deploy
   ```

### Frontend Production

1. **Configure environment:**

   ```env
   VITE_API_URL=<production-backend-url>
   # Update all Firebase and Supabase URLs to production instances
   ```

2. **Build:**

   ```bash
   pnpm build
   ```

3. **Deploy `dist` folder** to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## Testing

### Backend Testing

```bash
cd backend

# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

### Frontend Testing

```bash
cd frontend

# Lint
pnpm lint

# Type check
pnpm build
```

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solution:**

```bash
# 1. Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS
services.msc  # Windows (look for PostgreSQL)

# 2. Verify DATABASE_URL in .env
# 3. Test connection manually
psql -U auction -d online_auction

# 4. Create database if missing
createdb online_auction
```

### Redis Connection Issues

**Problem:** Backend fails to start (Redis connection error)

**Solution:**

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server  # macOS/Linux
# Windows: Run redis-server.exe
```

### Port Already in Use

**Problem:** Port 3000, 5173, 5432, or 6379 is already in use

**Solution:**

```bash
# Find and kill process on port (example for 3000)
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001  # Backend
# Frontend: Edit vite.config.ts
```

### Frontend Build Errors

**Problem:** Module not found or build fails

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Ensure pnpm is used (not npm)
# Check Node.js version
node --version  # Should be 18+
```

### Prisma Issues

**Problem:** Prisma Client not found

**Solution:**

```bash
cd backend
pnpm prisma:generate
```

**Problem:** Schema out of sync

**Solution:**

```bash
pnpm prisma:push
```

### Firebase Authentication Issues

**Problem:** Firebase auth not working

**Solution:**

1. Verify Firebase configuration in frontend `.env`
2. Check Firebase console for enabled authentication methods
3. Ensure authorized domains include `localhost:5173` and production domain
4. Download service account JSON and place in `backend/` directory

### Email Not Sending

**Problem:** Emails not being sent

**Solution:**

1. Verify `BREVO_API_KEY` is correct
2. Check Brevo dashboard for API limits/quota
3. Verify sender email domain is validated in Brevo
4. Check backend logs for email errors

## Available Scripts

### Backend Scripts

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `pnpm start:dev`             | Start development server with hot reload |
| `pnpm start:debug`           | Start with debugger                      |
| `pnpm build`                 | Build for production                     |
| `pnpm start:prod`            | Start production server                  |
| `pnpm test`                  | Run unit tests                           |
| `pnpm test:e2e`              | Run E2E tests                            |
| `pnpm test:cov`              | Generate test coverage                   |
| `pnpm lint`                  | Run ESLint                               |
| `pnpm format`                | Format code with Prettier                |
| `pnpm prisma:generate`       | Generate Prisma Client                   |
| `pnpm prisma:push`           | Push schema to database                  |
| `pnpm prisma:migrate`        | Create migration                         |
| `pnpm prisma:migrate:deploy` | Run migrations (production)              |
| `pnpm prisma:seed`           | Seed database                            |
| `pnpm prisma:studio`         | Open Prisma Studio                       |
| `pnpm db:setup`              | Complete database setup                  |

### Frontend Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm dev`     | Start development server |
| `pnpm build`   | Build for production     |
| `pnpm preview` | Preview production build |
| `pnpm lint`    | Run ESLint               |

### Database Scripts (db package)

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `pnpm db:setup`      | Complete setup (push + seed)      |
| `pnpm db:reset`      | Reset database (deletes all data) |
| `pnpm prisma:studio` | Open Prisma Studio                |

## Documentation

### Project Documentation

- **[Backend README](./backend/README.md)** - Complete backend documentation
- **[Frontend README](./frontend/README.md)** - Complete frontend documentation
- **[Database README](./db/README.md)** - Standalone database setup guide
- **[Docker Setup](./backend/DOCKER_SETUP.md)** - Docker deployment guide

### External Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit `.env` files** to version control
2. **Change all default secrets** in production
3. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
4. **Keep dependencies updated** regularly
5. **Enable HTTPS** in production
6. **Set up proper CORS** configuration
7. **Use environment-specific configs** (dev/staging/prod)
8. **Rotate secrets periodically**
9. **Monitor for security vulnerabilities**
10. **Backup database regularly**

## License

This project is part of the **CSC13008 Online Auction Platform** course final project.

## Contributors

Built by students of CSC13008 course.

---

**For detailed setup instructions, troubleshooting, and API documentation, please refer to the individual README files in each project directory.**
