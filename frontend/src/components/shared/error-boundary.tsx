import { isRouteErrorResponse,Link, useRouteError } from "react-router";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  let title = "Unexpected Error";
  let message = "Something went wrong. Please try again later.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = "Page Not Found";
      message = "Sorry, we couldn't find the page you're looking for.";
    } else if (error.status === 401) {
      title = "Unauthorized";
      message = "You need to log in to access this page.";
    } else if (error.status === 403) {
      title = "Forbidden";
      message = "You don't have permission to access this page.";
    } else if (error.status === 503) {
      title = "Service Unavailable";
      message =
        "Our servers are currently unavailable. Please try again later.";
    } else {
      title = error.statusText;
      message = error.data?.message || "An unexpected error occurred.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-secondary p-4 text-center">
      <div className="mb-6 rounded-full bg-error-light p-6">
        <AlertTriangle className="h-12 w-12 text-error" />
      </div>

      <h1 className="mb-2 text-3xl font-bold text-text lg:text-4xl">
        {status && <span className="mr-2 text-primary">{status}</span>}
        {title}
      </h1>

      <p className="mb-8 max-w-md text-text-secondary">{message}</p>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>

        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
