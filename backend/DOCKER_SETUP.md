# Docker Setup Guide - Online Auction Backend

## Overview

This guide explains how to set up and run the Online Auction backend using Docker Compose with PostgreSQL 17 Alpine.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- pnpm package manager

## Quick Start

### 1. Environment Setup

Copy the environment variables template:

```bash
cd backend
cp .env.example .env
```

The default configuration works out of the box for local development:

```env
DATABASE_URL="postgresql://auction:auction123@localhost:5432/online_auction?schema=public"
POSTGRES_USER="auction"
POSTGRES_PASSWORD="auction123"
POSTGRES_DB="online_auction"
```

### 2. Start Services with Docker Compose

```bash
# Start PostgreSQL and backend services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

This will:

- ✅ Start PostgreSQL 17 Alpine on port 5432
- ✅ Start NestJS backend on port 3000 (development mode with hot reload)
- ✅ Create persistent volume for database data

### 3. Run Database Migrations and Seed Data

**Option A: Inside Docker container**

```bash
# Access the backend container
docker-compose exec backend sh

# Run Prisma migrations
npm run prisma:push

# Seed the database
npm run prisma:seed

# Exit container
exit
```

**Option B: From host machine (if you have Node.js installed)**

```bash
npm run prisma:push
npm run prisma:seed
```

### 4. Verify Setup

- Backend API: http://localhost:3000
- Database: `postgresql://auction:auction123@localhost:5432/online_auction`

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
npm run prisma:studio
```

Access at: http://localhost:5555

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
npm run prisma:push
npm run prisma:seed
```

## Database Seed Data

After seeding, you'll have:

### Users

- **Admin**: `admin@auction.com` / `admin123456`
- **Seller1**: `seller1@test.com` / `password123`
- **Seller2**: `seller2@test.com` / `password123`
- **Seller3**: `seller3@test.com` / `password123`
- **Bidders**: `bidder1@test.com` through `bidder4@test.com` / `password123`
- **New Bidder (0 ratings)**: `newbidder@test.com` / `password123`

### Data

- 20+ products across 5 categories
- 40+ bids with complete history
- Q&A conversations
- User ratings
- Watchlist entries

## Troubleshooting

### Port Already in Use

If port 3000 or 5432 is already in use:

```env
# Edit .env
PORT=3001
POSTGRES_PORT=5433
```

Then restart:

```bash
docker-compose down
docker-compose up -d
```

### Database Connection Issues

Check if PostgreSQL is healthy:

```bash
docker-compose ps
docker-compose logs postgres
```

### Clear and Rebuild

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Production Build

For production deployment:

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

Note: Create `docker-compose.prod.yml` with production configuration and use the `production` target from Dockerfile.

## Next Steps

1. Access the API documentation at `/api` (when Swagger is configured)
2. Test endpoints using Postman/Thunder Client
3. Connect frontend to `http://localhost:3000`

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
└────────┬───────┘
         │
         ▼ PostgreSQL
┌────────────────┐
│  PostgreSQL 17 │
│  (Port 5432)   │
└────────────────┘
```

## Environment Variables Reference

| Variable                 | Description                  | Default               |
| ------------------------ | ---------------------------- | --------------------- |
| `DATABASE_URL`           | PostgreSQL connection string | See .env.example      |
| `JWT_SECRET`             | Secret for access tokens     | Change in production  |
| `JWT_REFRESH_SECRET`     | Secret for refresh tokens    | Change in production  |
| `JWT_EXPIRES_IN`         | Access token lifetime        | 15m                   |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime       | 7d                    |
| `PORT`                   | Backend server port          | 3000                  |
| `FRONTEND_URL`           | Frontend URL for CORS        | http://localhost:5173 |
| `NODE_ENV`               | Environment mode             | development           |

##Security Notes

⚠️ **Important**: Change all secrets in production!

- Generate strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Use strong database passwords
- Never commit `.env` to version control
- Use environment-specific configurations

---

For more details, see the implementation plan and API documentation.
