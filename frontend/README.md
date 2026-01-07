# Online Auction Platform - Frontend

Modern React-based frontend application for the Online Auction platform, built with TypeScript and Vite.

## Tech Stack

### Core

- **React:** 19.2.0
- **TypeScript:** 5.9.3
- **Build Tool:** Vite 7.2.5 (Rolldown)
- **Node.js:** 18+ (required)
- **Package Manager:** pnpm (required)

### Routing & State

- **Router:** React Router 7.11.0 (with Data API)
- **State Management:** Zustand 5.0.9
- **Data Fetching:** TanStack React Query 5.90.16

### UI & Styling

- **CSS Framework:** Tailwind CSS 4.1.18
- **UI Components:** Custom components with Radix UI patterns
- **Icons:** Lucide React 0.562.0
- **Notifications:** React Hot Toast 2.6.0

### Forms & Validation

- **Form Management:** React Hook Form
- **Validation:** Zod
- **Rich Text:** React Quill New 3.7.0

### Authentication & Security

- **Auth Provider:** Firebase 12.7.0
- **HTTP Client:** Axios 1.13.2
- **CAPTCHA:** React Google reCAPTCHA 3.1.0
- **Storage:** Supabase Storage

### Development Tools

- **Linting:** ESLint 9.39.1 with TypeScript support
- **Formatting:** Prettier 3.7.4 with Tailwind plugin
- **Compiler:** Babel React Compiler 1.0.0

## Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Backend service running (default: `http://localhost:3000`)
- Firebase project configured
- reCAPTCHA credentials
- Supabase project for file storage

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

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following environment variables in `.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Supabase Storage (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

### Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

Compiled files will be in the `dist` directory.

### Preview Production Build

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── cards/          # Product, Category, User cards
│   │   ├── layout/         # Header, Footer, Sidebar
│   │   ├── shared/         # BidInput, Countdown, etc.
│   │   └── ui/             # Base UI primitives (Button, Input, Card)
│   │
│   ├── pages/              # Application pages
│   │   ├── admin/          # Admin dashboard & management
│   │   ├── auth/           # Login, Register, Password reset
│   │   ├── home/           # Landing page
│   │   ├── products/       # Product listing & details
│   │   ├── profile/        # User profile, wallet, watchlist
│   │   └── seller/         # Seller dashboard & product management
│   │
│   ├── lib/                # Utilities and API clients
│   │   ├── api/            # API modules (auth, products, users, etc.)
│   │   └── utils.ts        # Helper functions
│   │
│   ├── routes/             # Route configuration
│   │
│   ├── stores/             # Zustand state stores
│   │   ├── auth.ts         # Authentication state
│   │   ├── theme.ts        # Theme preferences
│   │   └── category.ts     # Category caching
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── user.ts         # User interfaces
│   │   ├── product.ts      # Product interfaces
│   │   ├── bid.ts          # Bid interfaces
│   │   └── ...             # Other domain types
│   │
│   ├── hooks/              # Custom React hooks
│   │
│   ├── data/               # Static data and constants
│   │
│   ├── assets/             # Static assets (images, fonts)
│   │
│   ├── index.css           # Global styles and Tailwind directives
│   │
│   └── main.tsx            # Application entry point
│
├── public/                 # Static public assets
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Key Features

### 1. Authentication System

- JWT-based authentication (Access + Refresh tokens)
- Firebase OAuth integration
- Email verification with OTP
- Password reset functionality
- Secure token refresh mechanism
- Role-based access control (Guest, Bidder, Seller, Admin)

### 2. Product Browsing

- **Home Page:** Featured auctions, category showcase, top listings
- **Product Listing:** Advanced filtering by category, price range, status
- **Sorting Options:** Ending soon, price (high/low), newly listed
- **Search:** Full-text search with real-time results
- **Real-time Updates:** Automatic status updates for auctions

### 3. Bidding System

- Real-time bid placement
- Automatic bid validation (step price, minimum increment)
- Bid history tracking
- Auto-bidding configuration (set maximum bid)
- Countdown timer with automatic refresh
- Automatic auction extension (10 minutes if bid placed in last 5 minutes)
- Live bid notifications

### 4. User Dashboard

- **Bidder View:**
  - Active bids tracking
  - Won auctions
  - Watchlist management
  - Wallet balance
  - Order history

- **Seller View:**
  - Revenue statistics
  - Active listings management
  - Product creation/editing
  - Sales analytics
  - Rating overview

- **Admin View:**
  - User management
  - Category management
  - Product moderation
  - System statistics
  - Upgrade request handling

### 5. Product Management (Sellers)

- Create new product listings
- Upload multiple images (Cloudinary integration)
- Rich text description editor
- Set auction duration and pricing
- Edit active listings
- View performance analytics

### 6. Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Progressive Web App capabilities

### 7. Error Handling

- Global error boundary for crash recovery
- User-friendly error messages
- Automatic retry for failed requests
- 404 page for invalid routes
- Form validation feedback

## Routing Architecture

The application uses React Router 7 with the following route structure:

- `/` - Home page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset request
- `/products` - Product listing
- `/products/:id` - Product details
- `/profile` - User profile
- `/profile/wallet` - Wallet management
- `/profile/watchlist` - Saved products
- `/seller/dashboard` - Seller dashboard (lazy loaded)
- `/seller/products` - Manage products (lazy loaded)
- `/admin/*` - Admin routes (lazy loaded, requires admin role)

Lazy loading is implemented for admin and seller routes to optimize initial bundle size.

## State Management

### Zustand Stores

1. **Auth Store (`stores/auth.ts`)**
   - User authentication state
   - Token management
   - Login/logout actions
   - Role verification

2. **Theme Store (`stores/theme.ts`)**
   - Dark/light mode preference
   - Theme persistence

3. **Category Store (`stores/category.ts`)**
   - Category list caching
   - Reduce API calls

### React Query

Used for server state management:

- API data caching
- Automatic background refetching
- Optimistic updates
- Request deduplication

## API Integration

The frontend uses Axios with interceptors for API communication:

- **Base URL:** Configured via `VITE_API_URL`
- **Request Interceptor:** Adds JWT token to headers
- **Response Interceptor:** Handles token refresh and error responses
- **API Modules:** Organized by domain (auth, products, bids, users, etc.)

Example API structure:

```typescript
// lib/api/products/index.ts
export const getProducts = (params) => axios.get('/products', { params })
export const getProductById = (id) => axios.get(`/products/${id}`)
export const createProduct = (data) => axios.post('/products', data)
```

## Code Conventions

### File Naming

- **Components:** PascalCase files, e.g., `ProductCard.tsx`
- **Utils/Hooks:** camelCase files, e.g., `useAuth.ts`
- **Pages:** kebab-case directories, PascalCase files

### Import Paths

- Use absolute imports with `@/` prefix
- Configured in `vite.config.ts` and `tsconfig.json`

```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/stores/auth'
import { Product } from '@/types/product'
```

### Component Structure

```typescript
// External imports
import { useState } from 'react'

// Internal imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/stores/auth'

// Types
interface ComponentProps {
  // ...
}

// Component
export function Component({ prop }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

## Performance Optimizations

1. **Code Splitting:** Lazy loading for admin and seller routes
2. **Image Optimization:** Cloudinary transformations for responsive images
3. **Caching:** React Query for server state, Zustand for client state
4. **Memoization:** React Compiler automatically optimizes rendering
5. **Bundle Optimization:** Vite's Rolldown bundler for faster builds

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Development Server Issues

**Port 5173 already in use:**

```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 5173 (Linux/Mac)
lsof -ti:5173 | xargs kill -9
```

### Build Errors

**Type errors:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
pnpm install
```

**Module not found:**

- Check absolute import paths in `vite.config.ts`
- Ensure `tsconfig.json` paths are configured correctly

### API Connection Issues

1. Verify backend is running on configured `VITE_API_URL`
2. Check CORS settings in backend
3. Verify JWT tokens in browser DevTools (Application → Local Storage)
4. Clear browser cache and localStorage

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Restart dev server after changing `.env`
- Variables are embedded at build time (rebuild after changes)

### Firebase Authentication Issues

1. Verify Firebase configuration in `.env`
2. Check Firebase console for enabled authentication methods
3. Ensure correct authorized domains in Firebase console

## Testing

Currently using manual testing workflow. Future plans include:

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Various Platforms

**Vercel:**

```bash
vercel deploy
```

**Netlify:**

```bash
netlify deploy --prod
```

**Static Hosting:**
Upload the `dist` folder to any static hosting service.

### Environment Variables in Production

Ensure all `VITE_*` variables are configured in your hosting platform's environment settings.

## Contributing

1. Follow existing code structure and conventions
2. Use TypeScript for type safety
3. Run `pnpm lint` before committing
4. Test on multiple browsers
5. Keep components focused and reusable

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## License

This project is part of the CSC13008 course final project.
