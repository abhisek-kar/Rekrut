import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import { createJobSchema, createDraftJobSchema } from "@/lib/validators/job";
import Job from "@/models/Job";
import { ZodError } from "zod";
import Activity from "@/models/Activity";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const createdBy = searchParams.get("createdBy") || "";
    const assignedTo = searchParams.get("assignedTo") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Advanced filter parameters
    const department = searchParams.get("department") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const locationType = searchParams.get("locationType") || "";
    const visibility = searchParams.get("visibility") || "";
    const featured = searchParams.get("featured") || "";

    // Build query
    const query: Record<string, unknown> = {};

    // Status filter
    if (status && status !== "all") {
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

    // Created by filter
    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    // Assigned to filter
    if (assignedTo && assignedTo !== "all") {
      query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    // Advanced filters
    if (department && department !== "all") {
      query.department = department;
    }

    if (employmentType && employmentType !== "all") {
      query.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== "all") {
      query.experienceLevel = experienceLevel;
    }

    if (locationType && locationType !== "all") {
      query["location.type"] = locationType;
    }

    if (visibility && visibility !== "all") {
      query.visibility = visibility;
    }

    if (featured && featured !== "all") {
      query.featured = featured === "true";
    }

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .select(
        "-_id slug publicId title company department location description responsibilities requirements skills experienceLevel educationRequirements employmentType salary benefits perks applicationDeadline expectedStartDate applicationInstructions requiredDocuments screeningQuestions customFields visibility featured status isTemplate templateId createdBy assignedTo createdAt updatedAt"
      );

    return NextResponse.json({
      jobs,
      pagination: {
        total: totalJobs,
        page,
        limit,
        pages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse job data from request
    const data = await request.json();

    // Validate job data based on status
    try {
      // Use relaxed validation for drafts, full validation for active/published jobs
      if (data.status === "draft") {
        createDraftJobSchema.parse(data);
      } else {
        createJobSchema.parse(data);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Add the current user as creator
    data.createdBy = session.user.id;

    // Create new job
    const job = await Job.create(data);

    // Get the job without _id for response
    const jobResponse = await Job.findById(job._id)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .select(
        "-_id slug publicId title company department location description responsibilities requirements skills experienceLevel educationRequirements employmentType salary benefits perks applicationDeadline expectedStartDate applicationInstructions requiredDocuments screeningQuestions customFields visibility featured status isTemplate templateId createdBy assignedTo createdAt updatedAt"
      );

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: data.isTemplate ? "create_template" : "create",
      entityType: data.isTemplate ? "job_template" : "job",
      entityId: job._id,
      details: {
        title: job.title,
        company: job.company,
        status: job.status,
      },
      ipAddress:
        request.headers.get("x-forwarded-for") || request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
      {
        job: jobResponse,
        message: data.isTemplate
          ? "Job template created successfully"
          : "Job created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create job",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
