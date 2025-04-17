import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import jwt from "jsonwebtoken";
import { applyRateLimit } from "@/lib/rate-limit";

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "subadmin"]),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 5 attempts per minute
    const rateLimitResult = applyRateLimit(request, {
      interval: 60 * 1000, // 1 minute
      maxRequests: 5,       // 5 requests
    });

    if (rateLimitResult?.isLimited) {
      return NextResponse.json(
        { 
          message: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil(rateLimitResult.timeUntilReset / 1000) // seconds until reset
        },
        { 
          status: 429, // Too Many Requests
          headers: {
            "Retry-After": Math.ceil(rateLimitResult.timeUntilReset / 1000).toString()
          }
        }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse and validate request
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { email, password, role, rememberMe } = result.data;

    // Find user
    const user = await User.findOne({ email, role });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { message: "Your account is inactive. Please contact the administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Make sure JWT_SECRET is set
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: rememberMe ? "30d" : "1d",
      }
    );

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Create the response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token, // Still include token in response for client-side storage if needed
    });

    // Set HTTP-only cookie with the token
    // This cookie will be automatically sent with subsequent requests
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true, // Prevents JavaScript from reading the cookie
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict", // Prevents the cookie from being sent in cross-site requests
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day in seconds
      path: "/", // Cookie available for all paths
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
