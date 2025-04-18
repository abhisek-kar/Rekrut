import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AuthFormValues = {
  email: string;
  password: string;
  role: "admin" | "subadmin";
  rememberMe?: boolean;
};

export function useAuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: AuthFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call NextAuth signIn with the 'credentials' provider
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (!result) {
        throw new Error("Authentication failed. No response from server.");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Login successful!");
      
      // Redirect based on role
      const redirectPath = values.role === "admin" ? "/admin/dashboard" : "/subadmin/dashboard";
      router.push(redirectPath);
      
      return result;
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset instructions");
      }

      toast.success("Password reset instructions sent to your email");
      return true;
    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success("Password reset successful");
      return true;
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          firstName,
          lastName,
          password,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete account setup");
      }

      toast.success("Account setup completed successfully");
      return true;
    } catch (err) {
      console.error("Account setup error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
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
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleAccountSetup,
  };
}
