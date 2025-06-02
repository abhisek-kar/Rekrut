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
    const url = new URL(req.url);
    
    // Parse query parameters for filtering
    const status = url.searchParams.get("status") || "all";
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    
    // Build filter based on query parameters
    const filter: Record<string, unknown> = { assignedTo: subadminId };
    if (status !== "all") {
      filter.status = status;
    }
    
    // Get jobs and total count
    const jobs = await Job.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalCount = await Job.countDocuments(filter);
    
    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCounts = {
          total: await Application.countDocuments({ jobId: job._id }),
          new: await Application.countDocuments({ 
            jobId: job._id, 
            status: "applied",
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }),
          interviewing: await Application.countDocuments({ 
            jobId: job._id, 
            status: "interview" 
          }),
          offered: await Application.countDocuments({ 
            jobId: job._id, 
            status: "offer" 
          }),
          hired: await Application.countDocuments({ 
            jobId: job._id, 
            status: "hired" 
          }),
        };
        
        return {
          ...job,
          applicationCounts,
        };
      })
    );
    
    // Get status-based counts for summary stats
    const counts = {
      all: await Job.countDocuments({ assignedTo: subadminId }),
      published: await Job.countDocuments({ assignedTo: subadminId, status: "published" }),
      draft: await Job.countDocuments({ assignedTo: subadminId, status: "draft" }),
      closed: await Job.countDocuments({ assignedTo: subadminId, status: "closed" }),
      archived: await Job.countDocuments({ assignedTo: subadminId, status: "archived" }),
    };
    
    return NextResponse.json({
      jobs: jobsWithCounts,
      counts,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error in subadmin jobs summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs summary" },
      { status: 500 }
    );
  }
}
