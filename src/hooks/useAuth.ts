"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AUTH_ROUTES, getDefaultLoginRedirect } from "@/lib/routes";

// Type for our user object
type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "subadmin";
  profilePhoto?: string;
};

// Type for the hook return value
type UseAuthReturn = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: "admin" | "subadmin") => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading" || loading;

  // Map session user to our expected user format with proper type safety
  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "", // Use nullish coalescing for explicit null/undefined handling
        firstName: session.user.firstName ?? "",
        lastName: session.user.lastName ?? "",
        role: session.user.role as "admin" | "subadmin", // Type assertion since we validate below
        profilePhoto: session.user.profilePhoto ?? undefined,
      }
    : null;

  // Validate user data integrity
  if (user && (!user.role || !user.id)) {
    console.error("Invalid user session data:", {
      hasRole: !!user.role,
      hasId: !!user.id,
      email: user.email
    });
    // Force logout if session is corrupted
    signOut({ redirect: false });
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login,
      logout,
      refreshSession,
    };
  }

  // Login function with improved error handling
  const login = async (
    email: string,
    password: string,
    role: "admin" | "subadmin"
  ) => {
    if (!email || !password || !role) {
      throw new Error("Email, password, and role are required");
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
        callbackUrl: getDefaultLoginRedirect(role),
      });

      if (!result) {
        throw new Error("Authentication failed. No response from server.");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.url) {
        router.push(result.url);
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.push(AUTH_ROUTES.LOGOUT); // Use centralized route
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      await update();
      return true;
    } catch (error) {
      console.error("Session refresh error:", error);
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
  };
}

export default useAuth;
