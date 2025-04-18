"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useAuth as useNextAuth } from "@/hooks/useAuth";

// Create context type for TypeScript
type AuthContextType = ReturnType<typeof useNextAuth>;

// Create context with default placeholder values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
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
