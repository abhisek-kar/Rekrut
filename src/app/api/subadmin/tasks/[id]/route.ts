import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Task from "@/models/Task";
import dbConnect from "@/lib/db/connect";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "subadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Only SubAdmins can access this endpoint." },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const taskId = params.id;
    const subadminId = session.user.id;
    
    // Find the task and ensure it belongs to this subadmin
    const task = await Task.findOne({
      _id: taskId,
      assignedTo: subadminId,
    });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found or you don't have permission to update it" },
        { status: 404 }
      );
    }
    
    // Get update data from request
    const data = await req.json();
    const { status, notes } = data;
    
    // Update only allowed fields
    if (status) {
      task.status = status;
    }
    
    if (notes) {
      task.notes = notes;
    }
    
    task.updatedAt = new Date();
    
    await task.save();
    
    return NextResponse.json({
      task,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
