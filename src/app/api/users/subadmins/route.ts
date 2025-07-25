import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import crypto from "crypto";
import { sendEmail, generateAccountSetupEmail } from "@/lib/email";
import { auth } from "@/auth"; 

// ... (your subadminSchema remains the same)
const subadminSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  password: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  sendSetupEmail: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // --- The rest of your GET logic is correct and remains the same ---
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { role: "subadmin" };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -setupToken -setupTokenExpires"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        profilePhoto: user.profilePhoto,
        phone: user.phone,
        permissions: user.permissions || [],
        createdAt: user.createdAt,
      })),
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching subadmins:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching subadmins" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✨ CORRECT: Get the session using the modern auth() function
    const session = await auth();

    // ✨ CORRECT: Check the role from the secure session object
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // --- The rest of your POST logic is correct and remains the same ---
    await dbConnect();
    let formData;
    let body;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
      body = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        status: formData.get("status"),
        sendSetupEmail: formData.get("sendSetupEmail") === "true",
        permissions: JSON.parse(
          (formData.get("permissions") as string) || "[]"
        ),
      };
    } else {
      body = await request.json();
    }

    const result = subadminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const validatedData = result.data;
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    let setupToken, setupTokenExpiry;
    let password = validatedData.password;
    if (!password || validatedData.sendSetupEmail) {
      setupToken = crypto.randomBytes(32).toString("hex");
      setupTokenExpiry = new Date();
      setupTokenExpiry.setHours(setupTokenExpiry.getHours() + 24);
      if (!password) {
        password = crypto.randomBytes(10).toString("hex");
      }
    }

    const subadmin = new User({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      password: password,
      role: "subadmin",
      status: validatedData.status,
      permissions: validatedData.permissions,
      setupToken,
      setupTokenExpires: setupTokenExpiry,
    });

    if (contentType.includes("multipart/form-data") && formData) {
      const profilePhoto = formData.get("profilePhoto") as File;
      if (profilePhoto && profilePhoto.size > 0) {
        try {
          const timestamp = Date.now();
          const uniqueId = Math.random().toString(36).substring(2, 10);
          subadmin.profilePhoto = `/uploads/profile-photos/${timestamp}-${uniqueId}-${profilePhoto.name}`;
        } catch (error) {
          console.error("Error uploading profile photo:", error);
        }
      }
    }

    await subadmin.save();

    if (validatedData.sendSetupEmail) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const setupUrl = `${baseUrl}/account-setup?token=${setupToken}&email=${encodeURIComponent(
          validatedData.email
        )}`;
        const htmlContent = generateAccountSetupEmail(
          setupUrl,
          validatedData.email
        );
        await sendEmail({
          to: validatedData.email,
          subject: "Complete Your Rekrut ATS Account Setup",
          html: htmlContent,
        });
      } catch (emailError) {
        console.error("Error sending setup email:", emailError);
      }
    }

    const devInfo =
      process.env.NODE_ENV === "development" && validatedData.sendSetupEmail
        ? {
            devSetupUrl: `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/account-setup?token=${setupToken}&email=${encodeURIComponent(
              validatedData.email
            )}`,
          }
        : {};

    return NextResponse.json(
      {
        success: true,
        message: "SubAdmin created successfully",
        user: {
          id: subadmin._id,
          firstName: subadmin.firstName,
          lastName: subadmin.lastName,
          email: subadmin.email,
          role: subadmin.role,
          status: subadmin.status,
          profilePhoto: subadmin.profilePhoto,
        },
        ...devInfo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create SubAdmin error:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the SubAdmin" },
      { status: 500 }
    );
  }
}
