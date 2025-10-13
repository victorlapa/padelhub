import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, needsRegistration } = useAuth();
  const location = useLocation();

  // While checking authentication, you can optionally show a loading state
  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user needs registration and they're not already on the registration page
  if (needsRegistration && location.pathname !== "/complete-registration") {
    return <Navigate to="/complete-registration" replace />;
  }

  // If user doesn't need registration but they're on the registration page
  if (!needsRegistration && location.pathname === "/complete-registration") {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
