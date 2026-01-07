# Online Auction Platform

A comprehensive online auction platform built with modern web technologies, featuring real-time bidding, automatic bid extensions, and multi-role user management.

## Tech Stack

### Frontend

- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite (Rolldown)
- **Routing:** React Router 7.11.0
- **State Management:** Zustand 5.0.9
- **UI Components:** Custom components with Tailwind CSS 4.1.18
- **Data Fetching:** TanStack React Query 5.90.16
- **HTTP Client:** Axios 1.13.2
- **Authentication:** Firebase 12.7.0 + JWT
- **Storage:** Supabase Storage
- **Rich Text Editor:** React Quill
- **Notifications:** React Hot Toast

### Backend

- **Framework:** NestJS 11.0.1
- **Language:** TypeScript 5.7.3
- **Runtime:** Node.js (requires 18+)
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 6.8.2
- **Authentication:** JWT + Passport + Firebase Admin
- **Caching:** Redis (ioredis 5.5.0) - Required for OTP caching
- **Storage:** Supabase Storage + Cloudinary
- **Email Service:** Brevo API
- **File Upload:** Multer + Cloudinary
- **Task Scheduling:** NestJS Schedule

## Prerequisites

- **Node.js:** 18+ (check `package.json` for specific versions)
- **Package Manager:** pnpm (required)
- **Database:** PostgreSQL 15+
- **Cache:** Redis (required for OTP caching)
- **Firebase:** Project setup for authentication
- **Storage:** Supabase account for file storage
- **Email:** Brevo account for email notifications
- **Image CDN:** Cloudinary account for image CDN (optional)

## Quick Start

### 1. Install pnpm

```bash
npm install -g pnpm
```

### 2. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd csc13008-online-auction

# Install dependencies for both frontend and backend
pnpm install -r
```

### 3. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env
# Edit .env with your configurations

# Setup database
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:seed

# Start development server
pnpm start:dev
```

Backend will run on `http://localhost:3000`

### 4. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env
# Edit .env with your configurations

# Start development server
pnpm dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
csc13008-online-auction/
├── backend/              # NestJS backend application
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── products/    # Product management
│   │   ├── bids/        # Bidding system
│   │   ├── categories/  # Category management
│   │   ├── orders/      # Order processing
│   │   ├── ratings/     # Rating system
│   │   ├── questions/   # Q&A system
│   │   ├── email/       # Email service
│   │   ├── firebase/    # Firebase integration
│   │   ├── redis/       # Redis caching
│   │   └── scheduler/   # Background tasks
│   ├── prisma/          # Database schema and migrations
│   └── test/            # Test files
│
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── lib/         # Utilities and API clients
│   │   ├── stores/      # Zustand state stores
│   │   ├── types/       # TypeScript interfaces
│   │   ├── hooks/       # Custom React hooks
│   │   └── routes/      # Route definitions
│   └── public/          # Static assets
│
└── document/            # Project documentation
```

## Key Features

### User Management

- Multi-role system (Guest, Bidder, Seller, Admin)
- Email verification with OTP
- JWT-based authentication with refresh tokens
- Firebase OAuth integration
- Profile management with avatar upload
- User upgrade request system (Bidder → Seller)

### Product & Auction System

- Product creation and management
- Category-based organization
- Image upload with Cloudinary
- Rich text descriptions
- Automatic auction extension (last 5 minutes)
- Full-text search capabilities
- Real-time status updates

### Bidding System

- Real-time bid placement
- Auto-bidding functionality
- Bid history tracking
- Step price validation
- Maximum bid limits
- Email notifications for bid events

### Order Management

- Post-auction order creation
- Order status tracking
- Payment integration
- Order history

### Rating & Review System

- Product ratings
- Seller ratings
- Review management

### Q&A System

- Product questions
- Seller responses
- Question approval workflow

### Admin Features

- User management
- Category management
- Product moderation
- System monitoring
- Upgrade request handling

## Environment Variables

### Backend (.env)

```env
# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/online_auction

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Email (Brevo)
BREVO_API_KEY=your-brevo-key
BREVO_FROM_EMAIL=noreply@auction.com

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Frontend (.env)

```env
# API
VITE_API_URL=http://localhost:3000/api/v1

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase configs

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-key
```

## Available Scripts

### Backend

- `pnpm start:dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm db:setup` - Setup database and seed data

### Frontend

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Default Test Accounts (After Seeding)

### Admin

- Email: `admin@auction.com`
- Password: `admin123456`

### Test Sellers

- Email: `seller1@test.com` / `seller2@test.com`
- Password: `password123`

### Test Bidders

- Email: `bidder1@test.com` / `bidder2@test.com` / `bidder3@test.com`
- Password: `password123`

## API Documentation

The backend API follows RESTful conventions and is prefixed with `/api/v1`.

Main endpoints:

- `/auth` - Authentication endpoints
- `/users` - User management
- `/products` - Product CRUD
- `/bids` - Bidding operations
- `/categories` - Category management
- `/orders` - Order processing
- `/ratings` - Rating system
- `/questions` - Q&A system

For detailed API documentation, see [Backend README](./backend/README.md).

## Development Workflow

1. **Backend First:** Start the backend server and ensure database is running
2. **Frontend Development:** Start the frontend dev server
3. **Testing:** Use Prisma Studio to inspect database changes
4. **Seeding:** Use seed data for consistent testing environment

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in environment
2. Update `DATABASE_URL` to production database
3. Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
4. Configure production email service
5. Run `pnpm build`
6. Start with `pnpm start:prod`

### Frontend

1. Update `VITE_API_URL` to production backend URL
2. Configure production Firebase credentials
3. Run `pnpm build`
4. Deploy `dist` folder to hosting service

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check `DATABASE_URL` in backend `.env`
- Ensure database exists: `createdb online_auction`

### Frontend Build Issues

- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check Node.js version: `node --version` (should be 18+)
- Ensure pnpm is used, not npm

### Port Conflicts

- Backend default: 3000 (change with `PORT` env variable)
- Frontend default: 5173 (change in `vite.config.ts`)

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Run linters: `pnpm lint`
4. Commit changes: `git commit -m "feat: your feature"`
5. Push and create pull request

## License

This project is part of the CSC13008 course final project.

## Documentation

- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Backend README](./backend/README.md) - Backend-specific documentation
- [Docker Setup](./backend/DOCKER_SETUP.md) - Docker deployment guide
