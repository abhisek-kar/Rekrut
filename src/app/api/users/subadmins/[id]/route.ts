import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import User from "@/models/User";
import dbConnect from "@/lib/db/connect";
import { Types } from "mongoose";
import crypto from "crypto";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";
import { uploadToS3, generateS3Key, deleteFromS3 } from "@/lib/aws/s3";

// Validation schema for updating a SubAdmin
const updateSubadminSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }).optional(),
  lastName: z.string().min(2, { message: "Last name is required" }).optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
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

// Check if MongoDB ObjectId is valid
function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if request is from an admin
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find SubAdmin
    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpires -setupToken -setupTokenExpires");

    if (!user) {
      return NextResponse.json(
        { message: "SubAdmin not found" },
        { status: 404 }
      );
    }

    // Ensure we're only fetching subadmins
    if (user.role !== "subadmin") {
      return NextResponse.json(
        { message: "User is not a SubAdmin" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        profilePhoto: user.profilePhoto,
        phone: user.phone,
        permissions: user.permissions || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching subadmin:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the SubAdmin" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if request is from an admin
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find SubAdmin
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "SubAdmin not found" },
        { status: 404 }
      );
    }

    // Ensure we're only updating subadmins
    if (user.role !== "subadmin") {
      return NextResponse.json(
        { message: "User is not a SubAdmin" },
        { status: 400 }
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
        status: formData.get("status"),
        permissions: formData.get("permissions") 
          ? JSON.parse(formData.get("permissions") as string) 
          : undefined,
      };
    } else {
      body = await request.json();
    }

    // Validate request data
    const result = updateSubadminSchema.safeParse(body);

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
    if (validatedData.status) user.status = validatedData.status;
    if (validatedData.permissions) user.permissions = validatedData.permissions;

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
      message: "SubAdmin updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        permissions: user.permissions || [],
      },
    });
  } catch (error) {
    console.error("Update SubAdmin error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the SubAdmin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if request is from an admin
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find SubAdmin
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "SubAdmin not found" },
        { status: 404 }
      );
    }

    // Ensure we're only deleting subadmins
    if (user.role !== "subadmin") {
      return NextResponse.json(
        { message: "User is not a SubAdmin" },
        { status: 400 }
      );
    }

    // Delete profile photo from S3 if exists
    if (user.profilePhoto) {
      try {
        const key = getS3KeyFromUrl(user.profilePhoto);
        if (key) {
          await deleteFromS3(key);
        }
      } catch (error) {
        console.error("Error deleting profile photo:", error);
        // Continue with user deletion even if photo deletion fails
      }
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "SubAdmin deleted successfully",
    });
  } catch (error) {
    console.error("Delete SubAdmin error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the SubAdmin" },
      { status: 500 }
    );
  }
}
