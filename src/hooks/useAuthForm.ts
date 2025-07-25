// In src/hooks/useAuthForm.ts

"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useAuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NOTE: handleLogin is intentionally removed as the login page now uses a Server Action.

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      toast.success("Password reset instructions sent.");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to reset password");
      toast.success("Password has been reset successfully.");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSetup = async (
    token: string,
    firstName: string,
    lastName: string,
    password: string,
    phone?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/account-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, firstName, lastName, password, phone }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to set up account");
      toast.success("Account setup complete!");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    // handleLogin is no longer exported
    handleForgotPassword,
    handleResetPassword,
    handleAccountSetup,
  };
}
