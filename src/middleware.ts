import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPublicRoute, isAdminRoute, isSubadminRoute, AUTH_ROUTES } from "@/lib/routes";
import { log } from "@/lib/logger";

// Define API routes patterns that still need regex matching
const apiRoutes = [/^\/api\/(admin|subadmin|users|jobs|candidates|applications)(\/.*)?$/]; // Protected API routes
const authRoutes = [/^\/api\/auth\/(session|logout)(\/.*)?$/]; // Auth API routes that need token validation

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();
  
  log.debug("Middleware processing request", { 
    pathname, 
    method: request.method,
    userAgent: request.headers.get('user-agent') ?? undefined
  });

  // Check if the path is a public route (no auth required)
  if (isPublicRoute(pathname)) {
    log.debug("Public route access granted", { pathname });
    return NextResponse.next();
  }

  // Check if this is a protected route
  const needsAdminRole = isAdminRoute(pathname);
  const needsSubadminRole = isSubadminRoute(pathname);
  const isProtectedApiRoute = apiRoutes.some((pattern) => pattern.test(pathname));
  const isAuthApiRoute = authRoutes.some((pattern) => pattern.test(pathname));

  // If not a route we need to check, continue
  if (!needsAdminRole && !needsSubadminRole && !isProtectedApiRoute && !isAuthApiRoute) {
    log.debug("Unprotected route access granted", { pathname });
    return NextResponse.next();
  }

  // Get token from NextAuth with error handling
  let token;
  try {
    token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
  } catch (error) {
    log.error("Token verification failed", error as Error, { pathname });
    // If API route, return 401 unauthorized
    if (isProtectedApiRoute || isAuthApiRoute) {
      return NextResponse.json(
        { message: "Authentication error" },
        { status: 401 }
      );
    }
    // Otherwise redirect to login
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!token) {
    log.warn("No authentication token found", { pathname });
    // If API route, return 401 unauthorized
    if (isProtectedApiRoute || isAuthApiRoute) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Otherwise redirect to login (prevent infinite redirects)
    if (pathname === AUTH_ROUTES.LOGIN) {
      return NextResponse.next();
    }
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("redirect", encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(loginUrl);
  }

  try {
    log.debug("Token validation successful", { 
      pathname, 
      userId: token.id, 
      role: token.role 
    });
    
    // Check if user has the required role
    if (needsAdminRole && token.role !== "admin") {
      log.security("Admin access denied - insufficient privileges", { 
        pathname, 
        userId: token.id, 
        userRole: token.role, 
        requiredRole: "admin" 
      });
      
      // Prevent infinite redirects
      if (pathname === AUTH_ROUTES.LOGIN) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
    }
    
    if (needsSubadminRole && token.role !== "subadmin" && token.role !== "admin") {
      log.security("SubAdmin access denied - insufficient privileges", { 
        pathname, 
        userId: token.id, 
        userRole: token.role, 
        requiredRole: "subadmin" 
      });
      
      // Prevent infinite redirects
      if (pathname === AUTH_ROUTES.LOGIN) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
    }

    // Add user info to request headers for backend routes
    if (isProtectedApiRoute || isAuthApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", token.id as string);
      requestHeaders.set("x-user-role", token.role as string);
      
      const duration = Date.now() - startTime;
      log.debug("Protected API access granted", { 
        pathname, 
        userId: token.id, 
        role: token.role, 
        duration 
      });
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    const duration = Date.now() - startTime;
    log.debug("Protected route access granted", { 
      pathname, 
      userId: token.id, 
      role: token.role, 
      duration 
    });
    return NextResponse.next();
  } catch (error) {
    log.error("Authentication middleware error", error as Error, { pathname });
    
    // If API route, return 401 unauthorized
    if (isProtectedApiRoute || isAuthApiRoute) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Otherwise redirect to login
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
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
