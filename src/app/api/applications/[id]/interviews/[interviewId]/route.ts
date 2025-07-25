import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Application from "@/models/Application";
import Activity from "@/models/Activity";
import { auth } from "@/auth";

// PUT: Update a specific interview
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, interviewId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(interviewId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const data = await request.json();

    // Find and update the specific interview
    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        "interviews._id": interviewId,
      },
      {
        $set: {
          "interviews.$.dateTime": data.dateTime
            ? new Date(data.dateTime)
            : undefined,
          "interviews.$.duration": data.duration,
          "interviews.$.type": data.type,
          "interviews.$.interviewers": data.interviewers || [],
          "interviews.$.location": data.location,
          "interviews.$.videoLink": data.videoLink,
          "interviews.$.notes": data.notes,
          "interviews.$.status": data.status,
          "interviews.$.timezone": data.timezone || "UTC",
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application or interview not found" },
        { status: 404 }
      );
    }

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "update_interview",
      entityType: "application",
      entityId: id,
      details: {
        interviewId,
        interviewType: data.type,
        status: data.status,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    const updatedInterview = application.interviews?.find(
      (interview: any) => interview._id.toString() === interviewId
    );

    return NextResponse.json({
      message: "Interview updated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; interviewId: string } }
) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, interviewId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(interviewId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Remove the interview from the application
    const application = await Application.findByIdAndUpdate(
      id,
      {
        $pull: { interviews: { _id: interviewId } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "delete_interview",
      entityType: "application",
      entityId: id,
      details: {
        interviewId,
        reason: "Interview cancelled/deleted",
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
