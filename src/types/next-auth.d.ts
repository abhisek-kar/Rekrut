import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** User's ID */
      id: string;
      /** User's role */
      role: "admin" | "subadmin";
      /** User's first name */
      firstName: string;
      /** User's last name */
      lastName: string;
      /** User's profile photo URL */
      profilePhoto?: string;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string;
    role: "admin" | "subadmin";
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** User's ID */
    id: string;
    /** User's role */
    role: "admin" | "subadmin";
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
    /** User's profile photo URL */
    profilePhoto?: string;
  }
}
