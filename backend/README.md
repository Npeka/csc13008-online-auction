# Online Auction Platform - Backend

NestJS backend service for the Online Auction platform with PostgreSQL, Prisma ORM, and comprehensive features including authentication, bidding, orders, and real-time notifications.

## Tech Stack

### Core Framework

- **Framework:** NestJS 11.0.1
- **Language:** TypeScript 5.7.3
- **Runtime:** Node.js 18+ (required)
- **Package Manager:** pnpm (required)

### Database & ORM

- **Database:** PostgreSQL 15+
- **ORM:** Prisma 6.8.2
- **Caching:** Redis (ioredis 5.5.0) - Required for OTP caching

### Authentication & Security

- **JWT:** NestJS JWT 11.0.1
- **Passport:** passport 0.7.0, passport-jwt 4.0.1, passport-local 1.0.0
- **Password Hashing:** bcryptjs 3.0.3
- **Rate Limiting:** NestJS Throttler 6.4.0
- **Firebase Admin:** firebase-admin 13.6.0

### File Upload & Email

- **File Upload:** Multer 2.0.2
- **Cloud Storage:** Supabase Storage (primary) + Cloudinary 2.8.0 (CDN)
- **Email Service:** Brevo API (@getbrevo/brevo 3.0.1)
- **Email Transport:** Nodemailer 7.0.10

### Background Jobs & Scheduling

- **Task Scheduler:** NestJS Schedule 6.1.0

### Development Tools

- **Testing:** Jest 29.7.0
- **Linting:** ESLint 9.18.0
- **Formatting:** Prettier 3.4.2
- **TypeScript:** TypeScript ESLint 8.20.0

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- pnpm package manager
- Redis server (required for OTP caching)
- Brevo account (for email notifications)
- Supabase account (for file storage)
- Cloudinary account (optional, for image CDN)
- Firebase project (for OAuth authentication)

## Installation

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configurations:

```env
# Application Configuration
PORT=3000
API_PREFIX="api/v1"
NODE_ENV="development"

# Frontend URL (for CORS and email links)
FRONTEND_URL="http://localhost:5173"

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/online_auction?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration (Brevo API)
BREVO_API_KEY="your-brevo-api-key-here"
BREVO_FROM_EMAIL="noreply@auction.com"
BREVO_FROM_NAME="Online Auction Platform"

# Firebase (OAuth Authentication)
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Push schema to database (creates tables)
pnpm prisma:push

# Seed database with sample data
pnpm prisma:seed

# Or setup everything at once
pnpm db:setup
```

## Development

### Start Development Server

```bash
pnpm start:dev
```

The API will be available at `http://localhost:3000/api/v1`

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start:prod
```

## Available Scripts

### Development

- `pnpm start:dev` - Start development server with hot reload
- `pnpm start:debug` - Start with debugger attached
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server

### Database Management

- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:push` - Push schema to database
- `pnpm prisma:migrate` - Create and run migrations
- `pnpm prisma:reset` - Reset database (WARNING: deletes all data)
- `pnpm prisma:seed` - Seed database with test data
- `pnpm prisma:studio` - Open Prisma Studio (database GUI)
- `pnpm db:setup` - Complete database setup (push + seed)

### Testing

- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Generate test coverage report
- `pnpm test:debug` - Run tests with debugger
- `pnpm test:e2e` - Run end-to-end tests

### Code Quality

- `pnpm lint` - Run ESLint and auto-fix issues
- `pnpm format` - Format code with Prettier

## Project Structure

```
backend/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── guards/            # JWT, Local, Roles guards
│   │   ├── strategies/        # Passport strategies
│   │   └── auth.service.ts    # Auth business logic
│   │
│   ├── users/                  # User management module
│   │   ├── dto/               # User DTOs
│   │   ├── users.repository.ts # Data access layer
│   │   └── users.service.ts   # User business logic
│   │
│   ├── products/               # Product management module
│   │   ├── dto/               # Product DTOs
│   │   └── products.service.ts # Product business logic
│   │
│   ├── bids/                   # Bidding system module
│   │   ├── dto/               # Bid DTOs
│   │   └── bids.service.ts    # Bidding logic
│   │
│   ├── categories/             # Category management module
│   │   ├── dto/               # Category DTOs
│   │   └── categories.service.ts # Category logic
│   │
│   ├── orders/                 # Order processing module
│   │   ├── dto/               # Order DTOs
│   │   └── orders.service.ts  # Order business logic
│   │
│   ├── ratings/                # Rating system module
│   │   ├── dto/               # Rating DTOs
│   │   └── ratings.service.ts # Rating logic
│   │
│   ├── questions/              # Q&A system module
│   │   ├── dto/               # Question DTOs
│   │   └── questions.service.ts # Q&A logic
│   │
│   ├── email/                  # Email service module
│   │   ├── templates/         # Email templates
│   │   └── email.service.ts   # Email sending logic
│   │
│   ├── firebase/               # Firebase integration
│   │   └── firebase.service.ts # Firebase admin SDK
│   │
│   ├── redis/                  # Redis caching module
│   │   └── redis.service.ts   # Cache management
│   │
│   ├── scheduler/              # Background job scheduler
│   │   └── scheduler.service.ts # Cron jobs
│   │
│   ├── system/                 # System utilities
│   │   └── system.controller.ts # Health checks
│   │
│   ├── common/                 # Shared utilities
│   │   ├── decorators/        # Custom decorators (@CurrentUser, @Roles)
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Custom guards
│   │   ├── interfaces/        # TypeScript interfaces
│   │   └── pipes/             # Validation pipes
│   │
│   ├── prisma/                 # Prisma service
│   │   └── prisma.service.ts  # Database connection
│   │
│   ├── app.module.ts           # Root module
│   ├── app.controller.ts       # Root controller
│   ├── app.service.ts          # Root service
│   └── main.ts                 # Application entry point
│
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma          # Prisma schema definition
│   └── seed.ts                # Database seeding script
│
├── test/                       # Test files
│   ├── app.e2e-spec.ts        # E2E tests
│   └── jest-e2e.json          # E2E test config
│
├── .env.example                # Example environment variables
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── nest-cli.json               # NestJS CLI configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Database Schema

The application uses Prisma with PostgreSQL. Main entities:

- **User:** User accounts with roles (Guest, Bidder, Seller, Admin)
- **Category:** Product categories
- **Product:** Auction items with images, descriptions, pricing
- **Bid:** Bid history and auto-bidding configurations
- **Order:** Post-auction orders
- **Rating:** Product and seller ratings
- **Question:** Product Q&A system
- **UpgradeRequest:** User upgrade requests (Bidder → Seller)

### View Database

Access Prisma Studio to browse and edit data:

```bash
pnpm prisma:studio
```

Opens at `http://localhost:5555`

### Database Migrations

```bash
# Create a new migration
pnpm prisma:migrate

# Reset database (WARNING: deletes all data)
pnpm prisma:reset
```

## Default Test Accounts (After Seeding)

### Admin Account

- **Email:** `admin@auction.com`
- **Password:** `admin123456`
- **Role:** ADMIN

### Test Sellers

- **Email:** `seller1@test.com` / `seller2@test.com`
- **Password:** `password123`
- **Role:** SELLER

### Test Bidders

- **Email:** `bidder1@test.com` / `bidder2@test.com` / `bidder3@test.com`
- **Password:** `password123`
- **Role:** BIDDER

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `PATCH /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/firebase` - Firebase OAuth login

### Users (`/users`)

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (Admin only)
- `POST /users/upload-avatar` - Upload avatar image
- `POST /users/upgrade-request` - Request seller upgrade
- `GET /users/upgrade-requests` - Get upgrade requests (Admin)
- `PATCH /users/upgrade-requests/:id` - Approve/reject upgrade (Admin)

### Categories (`/categories`)

- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `GET /categories/slug/:slug` - Get category by slug
- `POST /categories` - Create category (Admin only)
- `PATCH /categories/:id` - Update category (Admin only)
- `DELETE /categories/:id` - Delete category (Admin only)

### Products (`/products`)

- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Seller only)
- `PATCH /products/:id` - Update product (Owner/Admin only)
- `DELETE /products/:id` - Delete product (Owner/Admin only)
- `GET /products/seller/:sellerId` - Get seller's products
- `POST /products/:id/images` - Upload product images

### Bids (`/bids`)

- `GET /bids/product/:productId` - Get product bid history
- `POST /bids` - Place a bid
- `GET /bids/user/:userId` - Get user's bids
- `POST /bids/auto` - Configure auto-bidding
- `GET /bids/auto/:productId` - Get auto-bid configuration

### Orders (`/orders`)

- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order (after winning auction)
- `PATCH /orders/:id` - Update order status

### Ratings (`/ratings`)

- `GET /ratings/product/:productId` - Get product ratings
- `GET /ratings/seller/:sellerId` - Get seller ratings
- `POST /ratings` - Create rating
- `PATCH /ratings/:id` - Update rating
- `DELETE /ratings/:id` - Delete rating

### Questions (`/questions`)

- `GET /questions/product/:productId` - Get product questions
- `POST /questions` - Ask a question
- `POST /questions/:id/answer` - Answer question (Seller)
- `PATCH /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

## Security Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 salt rounds)
- Protected routes with guards
- `@Roles()` decorator for role-based endpoints
- `@CurrentUser()` decorator to access authenticated user

### Rate Limiting

- Global rate limiting configured
- Special limits for authentication endpoints
- Configurable via environment variables

### Data Validation

- Request validation with `class-validator`
- Input sanitization with `class-transformer`
- DTO validation on all endpoints
- Type safety with TypeScript

### Error Handling

- Global exception filter
- Prisma error handling
- Structured error responses
- No sensitive data exposure in production

### CORS

- Configurable allowed origins
- Credentials support
- Preflight request handling

## Background Jobs (Scheduler)

The scheduler module handles automated tasks:

- **Auction Status Updates:** Automatically close expired auctions
- **Auto-bidding Processing:** Process auto-bid configurations
- **Email Notifications:** Send scheduled email notifications
- **Data Cleanup:** Remove expired sessions, old logs

Configure job intervals in the scheduler service.

## Email Service

The application uses Brevo (formerly Sendinblue) for transactional emails:

- **Registration:** Welcome email with verification OTP
- **Password Reset:** Reset password link
- **Bid Notifications:** Notify when outbid
- **Auction Won:** Congratulations email
- **Auction Lost:** Notification email
- **Order Updates:** Order status changes

Email templates are located in `src/email/templates/`

## File Upload

Files are stored using Supabase Storage with Cloudinary for CDN:

- **Primary Storage:** Supabase Storage for all file uploads
- **User Avatars:** Profile pictures
- **Product Images:** Multiple images per product
- **Image CDN:** Cloudinary for optimized image delivery (optional)
- **Image Transformations:** Automatic optimization and resizing

Configure Supabase credentials in `.env`

## Caching with Redis

Redis is **required** for:

- **OTP Caching:** Email verification and password reset OTPs (required)
- **Session Storage:** User sessions
- **Rate Limiting:** Request counting
- **Data Caching:** Frequently accessed data
- **Queue Management:** Background job queues

Redis must be running for the application to function properly.

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:cov
```

### E2E Tests

```bash
# Run end-to-end tests
pnpm test:e2e
```

Test files follow the pattern `*.spec.ts` for unit tests and `*.e2e-spec.ts` for E2E tests.

## Deployment

### Production Checklist

1. **Environment Variables:**

   - Set `NODE_ENV=production`
   - Use strong random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`
   - Configure production `DATABASE_URL`
   - Set production email credentials
   - Configure Supabase Storage credentials
   - Configure Cloudinary production account (optional)
   - Set correct `FRONTEND_URL`
   - Configure Redis connection

2. **Database:**

   - Run migrations: `pnpm prisma:migrate`
   - Do NOT use `prisma:push` in production
   - Setup database backups

3. **Build:**

   ```bash
   pnpm build
   ```

4. **Start:**
   ```bash
   pnpm start:prod
   ```

### Docker Deployment

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for Docker deployment instructions.

### Environment Variables for Production

Critical variables to configure:

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL` - Production PostgreSQL connection
- `JWT_SECRET` - Strong random string (use crypto)
- `JWT_REFRESH_SECRET` - Different strong random string
- `BREVO_API_KEY` - Production email API key
- `FRONTEND_URL` - Production frontend URL
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase credentials
- `REDIS_HOST` / `REDIS_PORT` - Redis connection (required)
- `SUPABASE_URL` / `SUPABASE_KEY` - Supabase Storage credentials

## Troubleshooting

### Database Connection Issues

**Cannot connect to PostgreSQL:**

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Ensure database `online_auction` exists
4. Verify user permissions

```bash
# Create database manually if needed
createdb online_auction
```

### Prisma Issues

**Prisma Client errors:**

```bash
# Regenerate Prisma client
pnpm prisma:generate
```

**Schema out of sync:**

```bash
# Push schema changes
pnpm prisma:push

# Or create migration
pnpm prisma:migrate
```

### Port Already in Use

**Error: Port 3000 already in use:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Or change port in `.env`:

```env
PORT=3001
```

### JWT Token Issues

**Invalid token errors:**

1. Check `JWT_SECRET` matches between requests
2. Verify token hasn't expired (default: 15 minutes)
3. Clear old tokens and login again
4. Check token format in Authorization header: `Bearer <token>`

### Email Not Sending

**Emails not being sent:**

1. Verify `BREVO_API_KEY` is correct
2. Check Brevo dashboard for API limits
3. Verify sender email is validated in Brevo
4. Check application logs for email errors

### File Upload Issues

**Image upload failing:**

1. Verify Cloudinary credentials
2. Check file size limits (default: 10MB)
3. Verify allowed file types (jpg, png, jpeg)
4. Check network connection to Cloudinary

## Performance Optimization

### Database Optimization

- Use database indexes (configured in Prisma schema)
- Connection pooling (configured in `DATABASE_URL`)
- Query optimization with Prisma

### Caching

- Implement Redis caching for frequently accessed data
- Cache database queries
- Cache API responses

### Load Balancing

- Use PM2 for process management
- Configure clustering for multiple CPU cores
- Setup reverse proxy (nginx)

## Monitoring & Logging

### Health Checks

- `GET /api/v1/health` - Application health status
- `GET /api/v1/system/stats` - System statistics (Admin only)

### Logging

- Request/response logging
- Error logging
- Database query logging (development only)

### Metrics

Monitor:

- Response times
- Error rates
- Database connection pool
- Memory usage
- CPU usage

## Contributing

1. Follow TypeScript best practices
2. Use dependency injection
3. Write unit tests for new features
4. Run linter before committing: `pnpm lint`
5. Format code with Prettier: `pnpm format`
6. Use conventional commits format

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## License

This project is part of the CSC13008 course final project.
