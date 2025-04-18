import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes patterns
const adminRoutes = [/^\/admin(\/.*)?$/];
const subadminRoutes = [/^\/subadmin(\/.*)?$/];
const apiRoutes = [/^\/api\/(admin|subadmin|users|jobs|candidates|applications)(\/.*)?$/];
const authRoutes = [/^\/api\/auth\/(session|logout)(\/.*)?$/];
const publicRoutes = [
  /^\/$/,
  /^\/\(auth\)\/login(\/.*)?$/,
  /^\/(auth)\/login(\/.*)?$/,
  /^\/login(\/.*)?$/,
  /^\/\(auth\)\/forgot-password(\/.*)?$/,
  /^\/(auth)\/forgot-password(\/.*)?$/,
  /^\/forgot-password(\/.*)?$/,
  /^\/\(auth\)\/reset-password(\/.*)?$/,
  /^\/(auth)\/reset-password(\/.*)?$/,
  /^\/reset-password(\/.*)?$/,
  /^\/\(auth\)\/account-setup(\/.*)?$/,
  /^\/(auth)\/account-setup(\/.*)?$/,
  /^\/account-setup(\/.*)?$/,
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/public(\/.*)?$/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("Middleware checking path:", pathname);

  // Check if the path is a public route (no auth required)
  const isPublicRoute = publicRoutes.some((pattern) => pattern.test(pathname));
  if (isPublicRoute) {
    console.log("Public route, allowing access");
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isAdminRoute = adminRoutes.some((pattern) => pattern.test(pathname));
  const isSubadminRoute = subadminRoutes.some((pattern) => pattern.test(pathname));
  const isProtectedApiRoute = apiRoutes.some((pattern) => pattern.test(pathname));
  const isAuthApiRoute = authRoutes.some((pattern) => pattern.test(pathname));

  // If not a route we need to check, continue
  if (!isAdminRoute && !isSubadminRoute && !isProtectedApiRoute && !isAuthApiRoute) {
    console.log("Not a protected route, allowing access");
    return NextResponse.next();
  }

  // Get token from NextAuth
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token) {
    console.log("No token found, redirecting to login");
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
    console.log("Token found, user role:", token.role);
    // Check if user has the required role
    if (isAdminRoute && token.role !== "admin") {
      console.log("User is not admin, redirecting");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    if (isSubadminRoute && token.role !== "subadmin" && token.role !== "admin") {
      console.log("User is not subadmin or admin, redirecting");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add user info to request headers for backend routes
    if (isProtectedApiRoute || isAuthApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", token.id as string);
      requestHeaders.set("x-user-role", token.role as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    console.log("Authentication successful, continuing");
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
