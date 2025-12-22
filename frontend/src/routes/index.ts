import { createBrowserRouter } from "react-router";
import { RootLayout, AuthLayout } from "@/components/layout/root-layout";
import { LoginPage, RegisterPage } from "@/pages/auth";
import { HomePage } from "@/pages/home";

const router = createBrowserRouter([
  // Main Layout
  {
    path: "/",
    Component: RootLayout,
    children: [{ index: true, Component: HomePage }],
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
