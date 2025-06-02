"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading" || loading;

  // Map session user to our expected user format
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email || "",
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        role: session.user.role || "subadmin",
        profilePhoto: session.user.profilePhoto,
      }
    : null;

  // Login function
  const login = async (
    email: string,
    password: string,
    role: "admin" | "subadmin"
  ) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
        callbackUrl:
          role === "admin" ? "/admin/dashboard" : "/subadmin/dashboard",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
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
      router.push("/auth/login");
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
