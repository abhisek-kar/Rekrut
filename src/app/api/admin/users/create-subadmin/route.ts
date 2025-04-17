import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import crypto from "crypto";
import { sendEmail, generateAccountSetupEmail } from "@/lib/email";

// Validation schema for creating a SubAdmin
const createSubAdminSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  sendSetupEmail: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Check if request is from an admin
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || userRole !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse and validate request
    const body = await request.json();
    const result = createSubAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, phone, permissions, sendSetupEmail } = result.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    // Generate account setup token
    const setupToken = crypto.randomBytes(32).toString("hex");
    const setupTokenExpiry = new Date();
    setupTokenExpiry.setHours(setupTokenExpiry.getHours() + 24); // Token valid for 24 hours

    // Create SubAdmin user
    const subadmin = new User({
      email,
      firstName,
      lastName,
      phone,
      role: "subadmin",
      status: "inactive", // Inactive until setup is completed
      permissions,
      setupToken,
      setupTokenExpiry,
      // Generate a temporary password that will be replaced during account setup
      password: crypto.randomBytes(16).toString("hex"),
    });

    await subadmin.save();

    // Send account setup email if requested
    if (sendSetupEmail) {
      // Construct setup URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const setupUrl = `${baseUrl}/account-setup?token=${setupToken}&email=${encodeURIComponent(email)}`;

      // Generate account setup email
      const htmlContent = generateAccountSetupEmail(setupUrl, email);

      // Send email
      await sendEmail({
        to: email,
        subject: "Complete Your Rekrut ATS Account Setup",
        html: htmlContent,
      });
    }

    // Development convenience - remove in production
    const devInfo = process.env.NODE_ENV === 'development' && sendSetupEmail
      ? { 
          devSetupUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account-setup?token=${setupToken}&email=${encodeURIComponent(email)}` 
        }
      : {};

    return NextResponse.json({
      success: true,
      message: "SubAdmin created successfully",
      user: {
        id: subadmin._id,
        email: subadmin.email,
        firstName: subadmin.firstName,
        lastName: subadmin.lastName,
        role: subadmin.role,
        status: subadmin.status,
      },
      ...devInfo,
    });
  } catch (error) {
    console.error("Create SubAdmin error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the SubAdmin" },
      { status: 500 }
    );
  }
}
