import { createBrowserRouter } from "react-router";
import { AuthLayout, RootLayout } from "@/components/layout/root-layout";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from "@/pages/auth";
import { HomePage } from "@/pages/home";
import { ProductDetailPage, ProductListingPage } from "@/pages/products";
import {
  BidsPage,
  ProfilePage,
  RatingsPage,
  WatchlistPage,
  WonPage,
} from "@/pages/profile";

const router = createBrowserRouter([
  // Main Layout
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: HomePage },
      { path: "products", Component: ProductListingPage },
      { path: "products/:slug", Component: ProductDetailPage },

      // Profile Routes
      { path: "profile", Component: ProfilePage },
      { path: "profile/watchlist", Component: WatchlistPage },
      { path: "profile/bids", Component: BidsPage },
      { path: "profile/won", Component: WonPage },
      { path: "profile/ratings", Component: RatingsPage },

      // Seller Routes
      {
        path: "seller/dashboard",
        async lazy() {
          const { SellerDashboard } = await import("@/pages/seller");
          return { Component: SellerDashboard };
        },
      },
      {
        path: "seller/products",
        async lazy() {
          const { SellerProductsPage } = await import("@/pages/seller");
          return { Component: SellerProductsPage };
        },
      },
      {
        path: "seller/products/new",
        async lazy() {
          const { CreateProductPage } = await import("@/pages/seller");
          return { Component: CreateProductPage };
        },
      },
      {
        path: "seller/products/:id/append",
        async lazy() {
          const { AppendDescriptionPage } = await import("@/pages/seller");
          return { Component: AppendDescriptionPage };
        },
      },

      // Admin Routes
      {
        path: "admin",
        async lazy() {
          const { AdminDashboard } = await import("@/pages/admin");
          return { Component: AdminDashboard };
        },
      },
      {
        path: "admin/categories",
        async lazy() {
          const { CategoriesManagement } = await import("@/pages/admin");
          return { Component: CategoriesManagement };
        },
      },
      {
        path: "admin/products",
        async lazy() {
          const { ProductsManagement } = await import("@/pages/admin");
          return { Component: ProductsManagement };
        },
      },
      {
        path: "admin/upgrades",
        async lazy() {
          const { UpgradeRequests } = await import("@/pages/admin");
          return { Component: UpgradeRequests };
        },
      },
    ],
  },

  // Auth Layout
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "reset-password", Component: ResetPasswordPage },
    ],
  },
]);

export default router;
