# Online Auction Frontend

This is the frontend application for the Online Auction platform, built with modern web technologies.

## 🚀 Tech Stack

- **Core:** [React](https://react.dev/) 18+, [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/) (Data API)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Auth, Theme, Category caching)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **API Client:** Axios (with interceptors for auth)
- **Forms:** React Hook Form + Zod validation

## 📂 Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── cards/           # Product, Category, User cards
│   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── shared/          # Shared specific components (BidInput, Countdown)
│   └── ui/              # Shadcn primitive components (Button, Input, Card...)
├── layouts/             # Page layouts (RootLayout, AuthLayout)
├── lib/                 # Utilities and API clients
│   ├── api/             # API definition (auth, products, users...)
│   └── utils.ts         # Helper functions
├── pages/               # Application pages
│   ├── admin/           # Admin dashboard & management
│   ├── auth/            # Login, Register, Reset Password
│   ├── home/            # Landing page
│   ├── products/        # Product listing & details
│   ├── profile/         # User profile, wallet, watchlist
│   └── seller/          # Seller dashboard & product management
├── routes/              # Route definitions
├── stores/              # Global state stores (Zustand)
└── types/               # TypeScript interfaces (User, Product, etc.)
```

## ✨ Key Features

### 1. Authentication

- JWT-based authentication (Access & Refresh Tokens).
- Roles: GUEST, BIDDER, SELLER, ADMIN.
- Registration with Email OTP verification.
- Re-implementation of `Users` service.

### 2. Product Browsing

- **Home Page:** Featured auctions, categories, top listings.
- **Product Listing:** Filter by category, price, sort (Ending Soon, Price, etc.).
- **Search:** Full-text search support.
- **Real-time:** Auto-update status on transition.

### 3. Bidding System

- Real-time bid updates.
- Automatic price extension (extend 10 mins if bid in last 5 mins).
- Bid validation (step price, max price).

### 4. Seller Dashboard

- **Dashboard:** Revenue stats, active listings overview.
- **Management:** Create/Edit products.

### 5. Routing & Error Handling

- Lazy loading for Admin & Seller routes.
- Global `ErrorBoundary` for 404 and crashes.

## 🛠️ Setup & Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📝 Conventions

- **Components:** PascalCase (e.g., `ProductCard.tsx`).
- **Files:** kebab-case (e.g., `product-card.tsx`).
- **Imports:** Use absolute imports `@/` (e.g., `import { Button } from "@/components/ui/button"`).

---

> This project is part of the CSC13008 course final project.
