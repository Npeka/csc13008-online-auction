import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/components/layout/root-layout";

const router = createBrowserRouter([
  // Main Layout
  {
    path: "/",
    Component: RootLayout,
  },
]);

export default router;
