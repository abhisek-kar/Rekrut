import { NextRequest, NextResponse } from "next/server";
import Activity from "@/models/Activity";
import dbConnect from "@/lib/db/connect";
import { Types } from "mongoose";

// Check if MongoDB ObjectId is valid
function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function GET(request: NextRequest) {
  try {
    // Check if request is from an admin
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "";
    const action = searchParams.get("action") || "";
    const entityType = searchParams.get("entityType") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Connect to database
    await dbConnect();

    // Build query
    const query: any = {};
    
    if (userId && isValidObjectId(userId)) {
      query.userId = userId;
    }
    
    if (action) {
      query.action = action;
    }
    
    if (entityType) {
      query.entityType = entityType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Execute query
    const totalActivities = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      activities,
      pagination: {
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching activities" },
      { status: 500 }
    );
  }
}
