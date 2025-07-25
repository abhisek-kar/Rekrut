// In src/hooks/useAuth.ts

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define the user type to match your application's needs
type AuthUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profilePhoto?: string | null;
  role: "admin" | "subadmin";
};

type UseAuthReturn = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // If the session is loading, return a loading state
  if (isLoading) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  // If not authenticated, the user is null
  if (!isAuthenticated || !session?.user) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  // If authenticated, map the session data to your old user structure
  const user: AuthUser = {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    profilePhoto: session.user.profilePhoto,
    role: session.user.role,
  };

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
  };
}
