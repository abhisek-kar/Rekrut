import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";

// Validation schema for account setup request
const accountSetupSchema = z.object({
  token: z.string().min(1, "Setup token is required"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse and validate request
    const body = await request.json();
    const result = accountSetupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { token, firstName, lastName, phone, password } = result.data;

    // Find user with valid setup token
    const user = await User.findOne({
      setupToken: token,
      setupTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Setup token is invalid or has expired" },
        { status: 400 }
      );
    }

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    if (phone) user.phone = phone;
    user.password = password;
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;
    user.status = "active";
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Account setup completed successfully",
    });
  } catch (error) {
    console.error("Account setup error:", error);
    return NextResponse.json(
      { message: "An error occurred during account setup" },
      { status: 500 }
    );
  }
}
