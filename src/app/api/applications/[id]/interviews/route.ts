import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import Application from "@/models/Application";
import User from "@/models/User";
import Activity from "@/models/Activity";

// POST: Add a new interview to an application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.dateTime || !data.duration || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields: dateTime, duration, type" },
        { status: 400 }
      );
    }

    // Find the application
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Validate interviewers if provided
    let validInterviewers = [];
    if (data.interviewers && data.interviewers.length > 0) {
      const interviewerIds = data.interviewers.map((interviewer: any) =>
        typeof interviewer === "string" ? interviewer : interviewer._id
      );

      const users = await User.find({
        _id: { $in: interviewerIds },
      });

      if (users.length !== interviewerIds.length) {
        return NextResponse.json(
          { error: "One or more interviewers not found" },
          { status: 400 }
        );
      }

      validInterviewers = interviewerIds;
    }

    // Create interview object
    const interview = {
      dateTime: new Date(data.dateTime),
      duration: data.duration,
      type: data.type,
      interviewers: validInterviewers,
      location: data.location || "",
      videoLink: data.videoLink || "",
      notes: data.notes || "",
      status: data.status || "scheduled",
      timezone: data.timezone || "UTC",
    };

    // Add interview to application
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        $push: { interviews: interview },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    ).populate({
      path: "interviews.interviewers",
      select: "firstName lastName email",
    });

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "schedule_interview",
      entityType: "application",
      entityId: id,
      details: {
        interviewType: data.type,
        interviewDate: data.dateTime,
        duration: data.duration,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Interview scheduled successfully",
      interview:
        updatedApplication?.interviews?.[
          updatedApplication.interviews.length - 1
        ],
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get all interviews for an application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const application = await Application.findById(id)
      .populate({
        path: "interviews.interviewers",
        select: "firstName lastName email",
      })
      .select("interviews");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      interviews: application.interviews || [],
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
