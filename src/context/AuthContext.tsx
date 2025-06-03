"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useAuth as useNextAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/atoms/loader";

// Create context type for TypeScript
type AuthContextType = ReturnType<typeof useNextAuth>;

// Create context with default placeholder values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (_email: string, _password: string, _role: "admin" | "subadmin") => false,
  logout: async () => {},
  refreshSession: async () => false,
});

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useNextAuth();

  // Show loading screen while authentication is being checked
  if (auth.isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
