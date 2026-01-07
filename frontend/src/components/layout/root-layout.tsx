import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";
import { ScrollRestoration } from "@/components/shared/scroll-restoration";
import { useAuthStore } from "@/stores/auth-store";
import { useCountsStore } from "@/stores/counts-store";
import { useCategoryStore } from "@/stores/category-store";
import { Footer } from "./footer";
import { Header } from "./header";

export function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isLoaded, fetchCounts } = useCountsStore();
  const { fetchCategories } = useCategoryStore();

  // Fetch counts on mount if authenticated and not already loaded
  useEffect(() => {
    if (isAuthenticated && !isLoaded) {
      fetchCounts();
    }
  }, [isAuthenticated, isLoaded, fetchCounts]);

  // Fetch categories on mount (will use cache if already loaded)
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ScrollRestoration />
      <Header />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-bg-card)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-success)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "white",
            },
          },
        }}
      />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <ScrollRestoration />
      <Outlet />
      <Toaster position="top-center" />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ScrollRestoration />
      <Header />
      <main className="container-app flex-1 py-6">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
