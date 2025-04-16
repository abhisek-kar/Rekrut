import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import crypto from "crypto";
// In a real application, you would use a proper email service
// import { sendEmail } from "@/lib/email";

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
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

    // In a real application, send email with reset link
    // await sendEmail({
    //   to: email,
    //   subject: "Reset Your Password",
    //   html: `
    //     <p>You requested a password reset. Click the link below to reset your password:</p>
    //     <p><a href="${resetUrl}">Reset Password</a></p>
    //     <p>This link will expire in 1 hour.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `,
    // });

    // For development purposes, we'll return the reset URL in the response
    // In production, this should be removed
    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive password reset instructions",
      // Only include this in development
      devResetUrl: resetUrl, 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
