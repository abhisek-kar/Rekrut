import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import crypto from "crypto";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting - 3 attempts per 10 minutes
    const rateLimitResult = applyRateLimit(request, {
      interval: 10 * 60 * 1000, // 10 minutes
      maxRequests: 3,           // 3 requests
    });

    if (rateLimitResult?.isLimited) {
      return NextResponse.json(
        { 
          message: "Too many password reset requests. Please try again later.",
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
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user (don't reveal if user exists for security reasons)
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive password reset instructions",
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Construct reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Generate password reset email
    const htmlContent = generatePasswordResetEmail(
      resetUrl, 
      `${user.firstName} ${user.lastName}`
    );

    // Send email
    await sendEmail({
      to: email,
      subject: "Reset Your Password - Rekrut ATS",
      html: htmlContent,
    });

    // Development convenience - remove in production
    const devInfo = process.env.NODE_ENV === 'development' 
      ? { devResetUrl: resetUrl }
      : {};

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive password reset instructions",
      ...devInfo,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
