import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
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
