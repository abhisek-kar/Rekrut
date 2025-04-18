import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { getToken } from "next-auth/jwt";

/**
 * Helper function to get the current user ID from the request
 * Works with both the header approach (from middleware) and direct session access
 */
export async function getCurrentUserId(req: NextRequest): Promise<string | null> {
  // First check if user ID was set in headers by middleware
  const userId = req.headers.get("x-user-id");
  if (userId) {
    return userId;
  }

  // If not in headers, try to get from NextAuth session
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  return token?.id as string || null;
}

/**
 * Helper function to get the current user role from the request
 * Works with both the header approach (from middleware) and direct session access
 */
export async function getCurrentUserRole(req: NextRequest): Promise<string | null> {
  // First check if user role was set in headers by middleware
  const userRole = req.headers.get("x-user-role");
  if (userRole) {
    return userRole;
  }

  // If not in headers, try to get from NextAuth session
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  return token?.role as string || null;
}

/**
 * Helper function to check if the current user is an admin
 */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  const role = await getCurrentUserRole(req);
  return role === "admin";
}

/**
 * Helper function to check if the current user is a subadmin
 */
export async function isSubadmin(req: NextRequest): Promise<boolean> {
  const role = await getCurrentUserRole(req);
  return role === "subadmin";
}

/**
 * Helper function to check if the current user is an admin or subadmin
 */
export async function isAdminOrSubadmin(req: NextRequest): Promise<boolean> {
  const role = await getCurrentUserRole(req);
  return role === "admin" || role === "subadmin";
}

/**
 * Get the full server session (for use in API routes)
 */
export async function getSession() {
  return await getServerSession(authOptions);
}
