import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Job from "@/models/Job";
import Application from "@/models/Application";
import dbConnect from "@/lib/db/connect";

export const dynamic = "force-dynamic";

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

    // Parse query parameters for pagination
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Get assigned job IDs for this subadmin
    const assignedJobIds = await Job.find({ assignedTo: subadminId }).distinct(
      "_id"
    );

    if (assignedJobIds.length === 0) {
      return NextResponse.json({
        applications: [],
        pagination: { total: 0, page, limit, pages: 0 },
      });
    }

    // Get recent applications for these jobs
    const applications = await Application.find({
      job: { $in: assignedJobIds },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("job", "title company location")
      .lean();

    const totalCount = await Application.countDocuments({
      job: { $in: assignedJobIds },
    });

    // Format applications with embedded candidate data
    const populatedApplications = applications.map((application) => {
      const job = application.job as any;
      return {
        ...application,
        job: {
          _id: job._id ? job._id.toString() : job.toString(),
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
        },
        candidate: {
          firstName: application.candidate.firstName,
          lastName: application.candidate.lastName,
          email: application.candidate.email,
        },
      };
    });

    return NextResponse.json({
      applications: populatedApplications,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error in subadmin recent applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent applications" },
      { status: 500 }
    );
  }
}
