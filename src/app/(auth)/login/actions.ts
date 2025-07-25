
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { getDashboardRoute } from "@/lib/routes";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // The signIn function handles the credential check and throws an error on failure
    await signIn("credentials", formData);

    // This part will likely not be reached on success, as middleware redirects.
    // However, it's good practice to handle it.
    const role = formData.get("role") === "subadmin" ? "subadmin" : "admin";
    return getDashboardRoute(role);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password.";
        default:
          return "An authentication error occurred. Please try again.";
      }
    }
    // Re-throw other errors to be caught by the error boundary
    throw error;
  }
}
