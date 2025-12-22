import { createBrowserRouter } from "react-router";
import { RootLayout, AuthLayout } from "@/components/layout/root-layout";
import { LoginPage, RegisterPage } from "@/pages/auth";

const router = createBrowserRouter([
  // Main Layout
  {
    path: "/",
    Component: RootLayout,
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
