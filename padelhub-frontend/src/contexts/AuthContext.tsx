import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/services/api";
import { verifyToken } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  needsRegistration: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check session on mount

  const login = React.useCallback((userData: User) => {
    setUser(userData);
    // Store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  }, []);

  const updateUser = React.useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAuthenticated = user !== null;

  // Check if user needs to complete registration (missing required fields)
  const needsRegistration = React.useMemo(() => {
    if (!user) return false;
    // User needs registration if they don't have phone, city, or category
    return !user.phone || !user.city || user.category === undefined;
  }, [user]);

  // Check localStorage and validate token on mount
  React.useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("authToken");

      if (storedUser && storedToken) {
        try {
          // Verify the token is still valid
          const isValid = await verifyToken(storedToken);

          if (isValid) {
            // Token is valid, restore the session
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear the session
            console.warn("Invalid or expired token, clearing session");
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // On error, clear the session to be safe
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
        }
      }

      // Always set loading to false after checking
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      isLoading,
      setIsLoading,
      needsRegistration,
    }),
    [user, isAuthenticated, login, logout, updateUser, isLoading, needsRegistration]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
