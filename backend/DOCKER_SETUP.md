# Docker Setup Guide - Online Auction Backend

## Overview

This guide explains how to set up and run the Online Auction backend using Docker Compose with PostgreSQL 17 Alpine and Redis.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- pnpm package manager

## Quick Start

### 1. Environment Setup

Copy the environment variables template:

```bash
cd backend
cp .env.example .env
```

The default configuration works out of the box for local development. Key variables from `.env.example`:

```env
# Application Configuration
PORT=3000
API_PREFIX="api/v1"
NODE_ENV="development"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Database Configuration
DATABASE_URL="postgresql://auction:auction123@localhost:5432/online_auction?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
DATABASE_HOST="auction"
DATABASE_PASSWORD="auction123"
DATABASE_DB="online_auction"
DATABASE_PORT=5432

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

### 2. Start Services with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend
```

This will:

- ✅ Start PostgreSQL 17 Alpine on port 5432
- ✅ Start Redis on port 6379 (required for OTP caching)
- ✅ Start NestJS backend on port 3000 (development mode with hot reload)
- ✅ Create persistent volumes for database and Redis data

### 3. Run Database Migrations and Seed Data

**Option A: Inside Docker container**

```bash
# Access the backend container
docker-compose exec backend sh

# Run Prisma migrations
pnpm prisma:push

# Seed the database
pnpm prisma:seed

# Exit container
exit
```

**Option B: From host machine (if you have Node.js and pnpm installed)**

```bash
pnpm prisma:push
pnpm prisma:seed
```

### 4. Verify Setup

- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/api/v1/health
- Database: `postgresql://auction:auction123@localhost:5432/online_auction`
- Redis: `localhost:6379`

## Docker Services

### PostgreSQL

- **Image:** postgres:17-alpine
- **Container Name:** auction-postgres
- **Port:** 5432
- **Persistent Volume:** postgres_data
- **Healthcheck:** Enabled (pg_isready)

### Redis

- **Image:** redis:alpine
- **Container Name:** auction-redis
- **Port:** 6379
- **Persistent Volume:** redis_data
- **Healthcheck:** Enabled (redis-cli ping)
- **Required:** Yes (for OTP caching)

### Backend

- **Container Name:** auction-backend
- **Port:** 3000
- **Volumes:** Hot reload enabled (.:/app with node_modules exclusion)
- **Dependencies:** Waits for PostgreSQL and Redis healthcheck
- **Command:** `npm run start:dev` (with hot reload)

## Development Workflow

### Hot Reload Development

The Docker setup includes volume mounting, so code changes are reflected immediately:

```bash
# Make code changes in src/
# Server automatically restarts
docker-compose logs -f backend
```

### Prisma Studio (Database GUI)

```bash
pnpm prisma:studio
```

Access at: http://localhost:5555

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop Services

```bash
# Stop but keep data
docker-compose down

# Stop and remove all data (⚠️ Warning: deletes database!)
docker-compose down -v
```

### Reset Database

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for services to be healthy, then seed
pnpm prisma:push
pnpm prisma:seed
```

## Database Seed Data

After seeding with `pnpm prisma:seed`, you'll have:

### User Accounts

**Admin:**

- Email: `admin@auction.com`
- Password: `admin123456`
- Role: ADMIN

**Test Sellers:**

- Email: `seller1@test.com`, `seller2@test.com`
- Password: `password123`
- Role: SELLER

**Test Bidders:**

- Email: `bidder1@test.com`, `bidder2@test.com`, `bidder3@test.com`
- Password: `password123`
- Role: BIDDER

### Sample Data

- 10+ product categories
- 100+ sample products with images
- Bids and auction history
- Ratings and reviews
- Q&A conversations
- Watchlist entries

## Troubleshooting

### Port Already in Use

If port 3000, 5432, or 6379 is already in use:

```env
# Edit .env
PORT=3001
DATABASE_PORT=5433
# Note: Redis port is hardcoded to 6379 in docker-compose.yml
```

Then restart:

```bash
docker-compose down
docker-compose up -d
```

### Database Connection Issues

Check if PostgreSQL is healthy:

```bash
# Check service status
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Check healthcheck status
docker inspect auction-postgres | grep -A 10 Health
```

### Redis Connection Issues

Redis is **required** for OTP caching:

```bash
# Check Redis status
docker-compose ps redis

# View Redis logs
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Backend Won't Start

```bash
# Check if dependencies are healthy
docker-compose ps

# View backend logs
docker-compose logs backend

# Rebuild if needed
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Clear and Rebuild Everything

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Re-seed database
pnpm prisma:push
pnpm prisma:seed
```

### Permission Issues (Linux/Mac)

```bash
# Fix ownership of node_modules
docker-compose exec backend chown -R node:node /app/node_modules
```

## Production Build

For production deployment:

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

**Note:** Create `docker-compose.prod.yml` with:

- Production environment variables
- No volume mounting (code baked into image)
- Use `production` target from Dockerfile
- Proper secrets management
- Production-grade PostgreSQL and Redis configuration

## Environment Variables Reference

| Variable                        | Description                  | Default                         | Required |
| ------------------------------- | ---------------------------- | ------------------------------- | -------- |
| `PORT`                          | Backend server port          | 3000                            | No       |
| `API_PREFIX`                    | API route prefix             | api/v1                          | No       |
| `NODE_ENV`                      | Environment mode             | development                     | No       |
| `FRONTEND_URL`                  | Frontend URL for CORS        | http://localhost:5173           | Yes      |
| `DATABASE_URL`                  | PostgreSQL connection string | See .env.example                | Yes      |
| `DATABASE_HOST`                 | PostgreSQL username          | auction                         | No       |
| `DATABASE_PASSWORD`             | PostgreSQL password          | auction123                      | No       |
| `DATABASE_DB`                   | Database name                | online_auction                  | No       |
| `DATABASE_PORT`                 | PostgreSQL port              | 5432                            | No       |
| `JWT_SECRET`                    | Secret for access tokens     | (change in production)          | Yes      |
| `JWT_EXPIRES_IN`                | Access token lifetime        | 15m                             | No       |
| `JWT_REFRESH_SECRET`            | Secret for refresh tokens    | (change in production)          | Yes      |
| `JWT_REFRESH_EXPIRES_IN`        | Refresh token lifetime       | 7d                              | No       |
| `BREVO_API_KEY`                 | Brevo email API key          | -                               | Yes      |
| `BREVO_FROM_EMAIL`              | Sender email address         | noreply@auction.com             | No       |
| `BREVO_FROM_NAME`               | Sender name                  | Online Auction Platform         | No       |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Firebase credentials path    | ./firebase-service-account.json | Yes      |

**Internal Docker variables (set automatically):**

- `REDIS_HOST=redis`
- `REDIS_PORT=6379`

## Architecture

```
┌────────────────┐
│   Frontend     │
│  (Port 5173)   │
└────────┬───────┘
         │
         ▼ HTTP
┌────────────────┐
│  NestJS API    │
│  (Port 3000)   │
└───┬─────┬──────┘
    │     │
    │     └──────────┐
    ▼                ▼
┌────────────┐  ┌─────────┐
│PostgreSQL  │  │  Redis  │
│(Port 5432) │  │  (6379) │
└────────────┘  └─────────┘
```

## Common Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend sh

# Rebuild specific service
docker-compose build backend

# Restart specific service
docker-compose restart backend

# Remove all data (⚠️ Warning!)
docker-compose down -v
```

## Security Notes

⚠️ **Important**: Change all secrets in production!

**Must change:**

- `JWT_SECRET` - Generate strong random string
- `JWT_REFRESH_SECRET` - Generate different strong random string
- `DATABASE_PASSWORD` - Use strong password
- `BREVO_API_KEY` - Use production API key
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Use production credentials

**Best practices:**

- Never commit `.env` to version control
- Use environment-specific configurations
- Use Docker secrets for sensitive data in production
- Regularly rotate secrets
- Use strong passwords (16+ characters, mixed case, symbols)

**Generate secure secrets:**

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

## Next Steps

1. ✅ Access the backend API at http://localhost:3000/api/v1
2. ✅ Test health endpoint at http://localhost:3000/api/v1/health
3. ✅ View database with Prisma Studio at http://localhost:5555
4. ✅ Connect frontend to `http://localhost:3000`
5. ✅ Test authentication endpoints with Postman/Thunder Client
6. ✅ Verify Redis is working (check OTP functionality)

## Additional Resources

- [Backend README](./README.md) - Complete backend documentation
- [Database Setup](../db/README.md) - Standalone database setup package
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Last Updated:** Compatible with current docker-compose.yml configuration including PostgreSQL 17 Alpine, Redis, and full environment variable set.
