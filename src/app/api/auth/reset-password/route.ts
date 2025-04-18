import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db/connect";
import User from "@/models/User";
import crypto from "crypto";
import { applyRateLimit } from "@/lib/rate-limit";

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 5 attempts per minute
    const rateLimitResult = applyRateLimit(request, {
      interval: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 requests
    });

    if (rateLimitResult?.isLimited) {
      return NextResponse.json(
        {
          message: "Too many reset attempts. Please try again later.",
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

    // Parse and validate request body
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid token or password", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Connect to the database
    await dbConnect();

    // Hash the token to check against stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update user's password and clear token fields
    user.password = password; // The model's pre-save hook will hash the password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
