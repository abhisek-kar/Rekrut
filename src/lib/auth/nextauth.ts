import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db/connect";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          // Find user by email and role
          const user = await User.findOne({
            email: credentials.email,
            role: credentials.role || { $in: ["admin", "subadmin"] },
          });

          if (!user) {
            return null;
          }

          // Check if user is active
          if (user.status !== "active") {
            throw new Error("User account is inactive");
          }

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password);
          if (!isPasswordValid) {
            return null;
          }

          // Update last login timestamp
          user.lastLogin = new Date();
          await user.save();

          // Return user object (will be encoded in the JWT)
          return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePhoto: user.profilePhoto,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profilePhoto = user.profilePhoto;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "subadmin";
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.profilePhoto = token.profilePhoto as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
