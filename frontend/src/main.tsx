import { QueryClientProvider } from "@tanstack/react-query";
// Uncomment to enable React Query DevTools:
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import router from "./routes";
import "./index.css";
import { queryClient } from "./lib/query-client";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    {/* Uncomment to enable React Query DevTools:
    <ReactQueryDevtools initialIsOpen={false} />
    */}
  </QueryClientProvider>,
  // </StrictMode>,
);
