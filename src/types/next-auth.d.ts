import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the built-in types to include your custom properties
declare module "next-auth" {
  /**
   * The Session object returned by `auth()` or `useSession()`
   */
  interface Session {
    user: {
      id: string;
      role: "admin" | "subadmin";
      firstName?: string | null;
      lastName?: string | null;
      profilePhoto?: string | null;
    } & DefaultSession["user"]; // Keep the default properties like name, email, image
  }

  /**
   * The User object passed to the `jwt` callback on sign-in.
   * This should match the object returned from the `authorize` function.
   */
  interface User extends DefaultUser {
    role: "admin" | "subadmin";
    firstName?: string | null;
    lastName?: string | null;
    profilePhoto?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * The JWT token that is encrypted and passed between requests.
   */
  interface JWT {
    id: string;
    role: "admin" | "subadmin";
    firstName?: string | null;
  }
}
