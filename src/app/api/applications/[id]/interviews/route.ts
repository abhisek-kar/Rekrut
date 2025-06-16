import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import Application from "@/models/Application";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { sendEmail } from "@/lib/email";
import { getEmailTemplate } from "@/lib/email/templates";
import { format } from "date-fns";

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

    // Validate interviewers (now just email addresses)
    let validInterviewers = [];
    if (data.interviewers && data.interviewers.length > 0) {
      // Since we're now using email addresses directly, just validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validInterviewers = data.interviewers.filter((email: string) =>
        emailRegex.test(email)
      );

      if (validInterviewers.length !== data.interviewers.length) {
        return NextResponse.json(
          { error: "One or more invalid email addresses" },
          { status: 400 }
        );
      }
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
    ).populate([
      { path: "candidate", select: "firstName lastName email" },
      { path: "job", select: "title company" },
    ]);

    // Send email notifications if requested
    if (data.sendEmailNotification && validInterviewers.length > 0) {
      try {
        const candidate = updatedApplication?.candidate as any;
        const job = updatedApplication?.job as any;

        if (candidate && job) {
          const interviewDateTime = format(
            new Date(data.dateTime),
            "PPP 'at' p"
          );
          const interviewType =
            data.type.charAt(0).toUpperCase() + data.type.slice(1);

          // Send notification to each interviewer
          for (const email of validInterviewers) {
            const template = getEmailTemplate("interview_notification", {
              interviewerEmail: email,
              candidateName: `${candidate.firstName} ${candidate.lastName}`,
              jobTitle: job.title,
              interviewDateTime,
              interviewType,
              duration: data.duration,
              location: data.location,
              videoLink: data.videoLink,
              timezone: data.timezone || "UTC",
              notes: data.notes,
              companyName: job.company,
            });

            if (template) {
              await sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
                text: template.text,
              });
            }
          }
        }
      } catch (emailError) {
        console.error("Error sending interview notifications:", emailError);
        // Don't fail the interview creation if email fails
      }
    }

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
