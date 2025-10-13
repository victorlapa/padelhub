import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/services/api";

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
  const [isLoading, setIsLoading] = useState(false);

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

  // Optional: Check localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
