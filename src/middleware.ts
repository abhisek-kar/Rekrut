// In src/middleware.ts

import { auth } from "@/auth";

export default auth;

// This config ensures the middleware only runs on routes that need protection
export const config = {
  matcher: ["/admin/:path*", "/subadmin/:path*"],
};
