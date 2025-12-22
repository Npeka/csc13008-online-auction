import { createBrowserRouter } from "react-router";
import { RootLayout, AuthLayout } from "@/components/layout/root-layout";
import { LoginPage, RegisterPage } from "@/pages/auth";
import { HomePage } from "@/pages/home";
import {
  ProductDetailPage,
  ProductListingPage,
  SearchPage,
} from "@/pages/products";
import {
  ProfilePage,
  WatchlistPage,
  BidsPage,
  WonPage,
  RatingsPage,
  SettingsPage,
} from "@/pages/profile";

const router = createBrowserRouter([
  // Main Layout
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "search", Component: SearchPage },
      { path: "category/:id", Component: ProductListingPage },
      { path: "product/:id", Component: ProductDetailPage },

      // Profile Routes
      { path: "profile", Component: ProfilePage },
      { path: "profile/watchlist", Component: WatchlistPage },
      { path: "profile/bids", Component: BidsPage },
      { path: "profile/won", Component: WonPage },
      { path: "profile/ratings", Component: RatingsPage },
      { path: "profile/settings", Component: SettingsPage },
    ],
  },

  // Auth Layout
  {
    path: "/",
    Component: AuthLayout,
    children: [
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
    ],
  },
]);

export default router;
