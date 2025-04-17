import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import { uploadToS3, generateS3Key, deleteFromS3 } from "@/lib/aws/s3";

// Validation schema for updating user profile
const updateProfileSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }).optional(),
  lastName: z.string().min(2, { message: "Last name is required" }).optional(),
  phone: z.string().optional(),
});

// Helper to extract S3 key from URL
function getS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove the domain part to get the key
    const path = urlObj.pathname;
    return path.startsWith('/') ? path.substring(1) : path;
  } catch (e) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user ID
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the user
    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires -setupToken -setupTokenExpires");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authenticated user ID
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Handle multipart form data or JSON
    let formData;
    let body;
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
      body = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
      };
    } else {
      body = await request.json();
    }

    // Validate request data
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const validatedData = result.data;

    // Update user fields
    if (validatedData.firstName) user.firstName = validatedData.firstName;
    if (validatedData.lastName) user.lastName = validatedData.lastName;
    if (validatedData.phone) user.phone = validatedData.phone;

    // Handle profile photo if it exists
    if (contentType.includes("multipart/form-data") && formData) {
      const profilePhoto = formData.get("profilePhoto") as File;
      
      if (profilePhoto && profilePhoto.size > 0) {
        try {
          // Delete old profile photo if exists
          if (user.profilePhoto) {
            const oldKey = getS3KeyFromUrl(user.profilePhoto);
            if (oldKey) {
              await deleteFromS3(oldKey);
            }
          }
          
          // Generate S3 key
          const s3Key = generateS3Key("profile-photos", profilePhoto.name);
          
          // Upload to S3
          const photoUrl = await uploadToS3(profilePhoto, s3Key);
          
          // Set profilePhoto field to the S3 URL
          user.profilePhoto = photoUrl;
        } catch (error) {
          console.error("Error updating profile photo:", error);
          // Continue without updating profile photo if upload fails
        }
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the profile" },
      { status: 500 }
    );
  }
}
