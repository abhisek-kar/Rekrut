import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import Job from "@/models/Job";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: {
      assignedTo: mongoose.Types.ObjectId;
      status?: string;
      $or?: Array<
        | { title: { $regex: string; $options: string } }
        | { company: { $regex: string; $options: string } }
        | { description: { $regex: string; $options: string } }
      >;
      isTemplate?: { $ne: boolean };
    } = {
      assignedTo: new mongoose.Types.ObjectId(session.user.id),
    };

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search filter (title, company, or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter out templates
    query.isTemplate = { $ne: true };

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");

    // For each job, count the number of applications
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await mongoose
          .model("Application")
          .countDocuments({
            jobId: job._id,
          });

        return {
          ...job.toObject(),
          applicationCount,
        };
      })
    );

    return NextResponse.json({
      jobs: jobsWithApplications,
      pagination: {
        total: totalJobs,
        page,
        limit,
        pages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assigned jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned jobs" },
      { status: 500 }
    );
  }
}
