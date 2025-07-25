// In src/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import dbConnect from "@/lib/db/connect";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.JWT_SECRET,

  pages: {
    signIn: "/login",
    error: "/error",
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          await dbConnect();
          const user = await User.findOne({ email });

          if (!user || user.status !== "active") return null;

          const passwordsMatch = await user.comparePassword(password);
          if (passwordsMatch) {
            user.lastLogin = new Date();
            await user.save();
            return user;
          }
        }
        return null;
      },
    }),
  ],

  callbacks: {
    authorized({ auth }) {
      // If the user has a session, they are authorized.
      // Route protection is handled by the matcher in middleware.ts.
      return !!auth?.user;
    },

    jwt({ token, user }) {
      // On the first sign-in, user object is available.
      if (user) {
        const userFromDb = user as any; // Cast to access Mongoose properties
        token.sub = userFromDb._id.toString();
        token.role = userFromDb.role;
        token.firstName = userFromDb.firstName;
        token.lastName = userFromDb.lastName;
        token.profilePhoto = userFromDb.profilePhoto;
      }
      return token;
    },

    session({ session, token }) {
      // Add custom properties from the token to the client-side session.
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as "admin" | "subadmin";
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.profilePhoto = token.profilePhoto as string;
      }
      return session;
    },
  },
});
