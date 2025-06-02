import { NextRequest, NextResponse } from "next/server";

/**
 * Security utility functions for API routes
 */

/**
 * Rate limiting utility (in-memory store for development)
 * In production, use Redis or external rate limiting service
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries
  rateLimitStore.forEach((v, k) => {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  });
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  // Fallback to connection IP
  return request.ip || "unknown";
}

/**
 * Validate request content type
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[] = ["application/json"]
): boolean {
  const contentType = request.headers.get("content-type");
  if (!contentType) return false;
  
  return allowedTypes.some(type => contentType.includes(type));
}

/**
 * CORS headers for API responses
 */
export function setCORSHeaders(
  response: NextResponse,
  allowedOrigins: string[] = [],
  allowedMethods: string[] = ["GET", "POST", "PUT", "DELETE"]
): NextResponse {
  const origin = "*"; // Configure based on your needs
  
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  
  return response;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Security middleware for API routes
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: { limit: number; windowMs: number };
    requireContentType?: string[];
    allowCORS?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const clientIP = getClientIP(request);
        const allowed = rateLimit(
          clientIP,
          options.rateLimit.limit,
          options.rateLimit.windowMs
        );
        
        if (!allowed) {
          return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
          );
        }
      }
      
      // Content type validation for POST/PUT requests
      if (
        options.requireContentType &&
        (request.method === "POST" || request.method === "PUT")
      ) {
        if (!validateContentType(request, options.requireContentType)) {
          return NextResponse.json(
            { error: "Invalid content type" },
            { status: 400 }
          );
        }
      }
      
      // Execute the handler
      const response = await handler(request);
      
      // Add CORS headers if requested
      if (options.allowCORS) {
        setCORSHeaders(response);
      }
      
      return response;
    } catch (error) {
      console.error("Security middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
