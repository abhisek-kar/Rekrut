import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Task from "@/models/Task";
import dbConnect from "@/lib/db/connect";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "subadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only SubAdmins can access this endpoint." },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const subadminId = session.user.id;
    const url = new URL(req.url);
    
    // Parse query parameters for filtering and pagination
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const taskType = url.searchParams.get("taskType");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    
    // Build filter based on query parameters
    const filter: Record<string, unknown> = { assignedTo: subadminId };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (taskType) {
      filter.taskType = taskType;
    }
    
    // Get tasks
    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, priority: -1 }) // Sort by due date (ascending) and priority (high to low)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "firstName lastName")
      .lean();
    
    const totalCount = await Task.countDocuments(filter);
    
    // Get counts for each status
    const counts = {
      all: await Task.countDocuments({ assignedTo: subadminId }),
      pending: await Task.countDocuments({ assignedTo: subadminId, status: "pending" }),
      inProgress: await Task.countDocuments({ assignedTo: subadminId, status: "inProgress" }),
      completed: await Task.countDocuments({ assignedTo: subadminId, status: "completed" }),
      cancelled: await Task.countDocuments({ assignedTo: subadminId, status: "cancelled" }),
    };
    
    return NextResponse.json({
      tasks,
      counts,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error in subadmin tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
