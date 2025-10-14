import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, needsRegistration } = useAuth();
  const location = useLocation();

  // While checking authentication, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-lg">Restaurando sessão...</p>
      </div>
    );
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
