import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Define protected routes patterns
const adminRoutes = [/^\/admin(\/.*)?$/];
const subadminRoutes = [/^\/subadmin(\/.*)?$/];
const apiRoutes = [/^\/api\/(admin|subadmin|users|jobs|candidates|applications)(\/.*)?$/];
const authRoutes = [/^\/api\/auth\/(session|logout)(\/.*)?$/];
const publicRoutes = [
  /^\/$/,
  /^\/login$/,
  /^\/forgot-password$/,
  /^\/reset-password$/,
  /^\/account-setup$/,
  /^\/api\/auth\/(login|forgot-password|reset-password|account-setup)(\/.*)?$/,
  /^\/api\/public(\/.*)?$/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route (no auth required)
  const isPublicRoute = publicRoutes.some((pattern) => pattern.test(pathname));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isAdminRoute = adminRoutes.some((pattern) => pattern.test(pathname));
  const isSubadminRoute = subadminRoutes.some((pattern) => pattern.test(pathname));
  const isProtectedApiRoute = apiRoutes.some((pattern) => pattern.test(pathname));
  const isAuthApiRoute = authRoutes.some((pattern) => pattern.test(pathname));

  // If not a route we need to check, continue
  if (!isAdminRoute && !isSubadminRoute && !isProtectedApiRoute && !isAuthApiRoute) {
    return NextResponse.next();
  }

  // Check for authorization header or JWT cookie
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : request.cookies.get("token")?.value;

  if (!token) {
    // If API route, return 401 unauthorized
    if (isProtectedApiRoute || isAuthApiRoute) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Otherwise redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    
    const { payload } = await jwtVerify(token, secret);
    
    // Check if user has the required role
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    if (isSubadminRoute && payload.role !== "subadmin" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add user info to request headers for backend routes
    if (isProtectedApiRoute || isAuthApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.id as string);
      requestHeaders.set("x-user-role", payload.role as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    // If API route, return 401 unauthorized
    if (isProtectedApiRoute || isAuthApiRoute) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Otherwise redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
