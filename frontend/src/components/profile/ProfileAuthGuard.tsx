import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

/**
 * ProfileAuthGuard
 * Wraps children and ensures the user is authenticated.
 * If not, displays a login prompt.
 */
export const ProfileAuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text">Please Login</h1>
        <p className="mb-8 text-text-muted">
          You need to be logged in to view this page.
        </p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
