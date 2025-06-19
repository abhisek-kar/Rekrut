import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Job from "@/models/Job";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    let job;

    // Try to find by slug first (preferred for SEO), then by publicId, then by ObjectId (legacy)
    if (id.includes("-")) {
      // Likely a slug
      job = await Job.findOne({
        slug: id,
        visibility: "public",
        status: "active",
      })
        .populate("createdBy", "firstName lastName")
        .lean();
    } else if (id.length === 36 && id.includes("-")) {
      // Likely a UUID (publicId)
      job = await Job.findOne({
        publicId: id,
        visibility: "public",
        status: "active",
      })
        .populate("createdBy", "firstName lastName")
        .lean();
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      // Legacy ObjectId support (for backward compatibility)
      job = await Job.findOne({
        _id: id,
        visibility: "public",
        status: "active",
      })
        .populate("createdBy", "firstName lastName")
        .lean();
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Increment view count (optional - you might want to track this)
    await Job.findByIdAndUpdate(job._id, {
      $inc: { viewCount: 1 },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
