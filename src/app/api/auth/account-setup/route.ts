import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db/connect";
import User from "@/models/User";
import crypto from "crypto";

// Validation schema
const accountSetupSchema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = accountSetupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { token, firstName, lastName, password, phone } = result.data;

    // Connect to the database
    await dbConnect();

    // Hash the token to check against stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid setup token
    const user = await User.findOne({
      setupToken: hashedToken,
      setupTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired setup token" },
        { status: 400 }
      );
    }

    // Update user information
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password; // Pre-save hook will hash this
    user.phone = phone || user.phone;
    user.status = "active";
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;

    await user.save();

    return NextResponse.json(
      { message: "Account setup completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account setup error:", error);
    return NextResponse.json(
      { message: "An error occurred while setting up your account" },
      { status: 500 }
    );
  }
}
