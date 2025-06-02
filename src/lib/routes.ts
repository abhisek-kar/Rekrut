/**
 * Centralized route configuration for the application
 * This file contains all route paths used throughout the app
 */

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: "/login",
  LOGOUT: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ACCOUNT_SETUP: "/account-setup",
  ERROR: "/error",
} as const;

// Dashboard routes
export const DASHBOARD_ROUTES = {
  ADMIN: "/admin/dashboard",
  SUBADMIN: "/subadmin/dashboard",
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  USERS: "/admin/users",
  SUBADMINS: "/admin/subadmins",
  SETTINGS: "/admin/settings",
  ANALYTICS: "/admin/analytics",
  CUSTOM_FIELDS: "/admin/custom-fields",
} as const;

// SubAdmin routes
export const SUBADMIN_ROUTES = {
  DASHBOARD: "/subadmin/dashboard",
  JOBS: "/subadmin/jobs",
  APPLICATIONS: "/subadmin/applications",
  CANDIDATES: "/subadmin/candidates",
  PROFILE: "/subadmin/profile",
} as const;

// Public routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  JOBS: "/jobs",
  JOB_DETAIL: (id: string) => `/jobs/${id}`,
  APPLY: (jobId: string) => `/apply/${jobId}`,
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/signin",
    LOGOUT: "/api/auth/signout",
    SESSION: "/api/auth/session",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    ACCOUNT_SETUP: "/api/auth/account-setup",
  },
  ADMIN: {
    USERS: "/api/admin/users",
    DASHBOARD: "/api/admin/dashboard",
    SETTINGS: "/api/admin/settings",
  },
  SUBADMIN: {
    JOBS: "/api/subadmin/jobs",
    APPLICATIONS: "/api/subadmin/applications",
    DASHBOARD: "/api/subadmin/dashboard",
  },
  PUBLIC: {
    JOBS: "/api/public/jobs",
    APPLY: "/api/public/apply",
  },
  SYSTEM: {
    HEALTH: "/api/health",
    STATUS: "/api/status",
  },
} as const;

// Candidate portal routes
export const CANDIDATE_ROUTES = {
  PORTAL: "/candidate-portal",
  APPLICATIONS: "/candidate-portal/applications",
  PROFILE: "/candidate-portal/profile",
  DOCUMENTS: "/candidate-portal/documents",
} as const;

/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(role: "admin" | "subadmin"): string {
  return role === "admin" ? DASHBOARD_ROUTES.ADMIN : DASHBOARD_ROUTES.SUBADMIN;
}

/**
 * Get the appropriate default route after login based on user role
 */
export function getDefaultLoginRedirect(role: "admin" | "subadmin"): string {
  return getDashboardRoute(role);
}

/**
 * Check if a route is a public route (no authentication required)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    AUTH_ROUTES.LOGIN,
    AUTH_ROUTES.FORGOT_PASSWORD,
    AUTH_ROUTES.RESET_PASSWORD,
    AUTH_ROUTES.ACCOUNT_SETUP,
    AUTH_ROUTES.ERROR,
    PUBLIC_ROUTES.HOME,
    PUBLIC_ROUTES.JOBS,
    API_ROUTES.SYSTEM.HEALTH, // Health check endpoint
    API_ROUTES.SYSTEM.STATUS, // Status endpoint
    "/api/auth",
    "/api/public",
  ];

  return publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  ) || pathname.startsWith("/jobs/") || pathname.startsWith("/apply/");
}

/**
 * Check if a route requires admin privileges
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/**
 * Check if a route requires subadmin privileges (or admin)
 */
export function isSubadminRoute(pathname: string): boolean {
  return pathname.startsWith("/subadmin");
}

// Export all routes in a single object for convenience
export const ROUTES = {
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  ADMIN: ADMIN_ROUTES,
  SUBADMIN: SUBADMIN_ROUTES,
  PUBLIC: PUBLIC_ROUTES,
  API: API_ROUTES,
  CANDIDATE: CANDIDATE_ROUTES,
} as const;

export default ROUTES;
