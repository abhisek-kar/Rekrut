import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Job from "@/models/Job";
import Application from "@/models/Application";
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
    
    // Get assigned jobs count
    const activeJobsCount = await Job.countDocuments({
      assignedTo: subadminId,
      status: "published",
    });
    
    const closedJobsCount = await Job.countDocuments({
      assignedTo: subadminId,
      status: { $in: ["closed", "archived"] },
    });
    
    // Get applications to review
    const applicationsToReview = await Application.countDocuments({
      jobId: { $in: await Job.find({ assignedTo: subadminId }).distinct("_id") },
      status: "applied",
    });
    
    // Get scheduled interviews
    const interviewsScheduled = await Application.countDocuments({
      jobId: { $in: await Job.find({ assignedTo: subadminId }).distinct("_id") },
      status: "interview",
      "interviews.status": "scheduled",
    });
    
    // Get recent hires
    const recentHires = await Application.countDocuments({
      jobId: { $in: await Job.find({ assignedTo: subadminId }).distinct("_id") },
      status: "hired",
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });
    
    // Get a few assigned jobs for the dashboard
    const assignedJobs = await Job.find({ assignedTo: subadminId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    return NextResponse.json({
      metrics: {
        activeJobsCount,
        closedJobsCount,
        applicationsToReview,
        interviewsScheduled,
        recentHires,
      },
      assignedJobs,
    });
  } catch (error) {
    console.error("Error in subadmin dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
