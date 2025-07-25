import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import Candidate from "@/models/Candidate";
import Application from "@/models/Application";
import Job from "@/models/Job";

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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skills = searchParams.get("skills") || "";
    const experience = searchParams.get("experience") || "";
    const location = searchParams.get("location") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: Record<string, any> = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search filter (name or email)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(",").map((skill) => skill.trim());
      query["skills.name"] = {
        $in: skillsArray.map((skill) => new RegExp(skill, "i")),
      };
    }

    // Experience filter
    if (experience) {
      const [min, max] = experience.split("-").map(Number);
      if (!isNaN(min)) {
        query.yearsOfExperience = { $gte: min };
        if (!isNaN(max)) {
          query.yearsOfExperience.$lte = max;
        }
      }
    }

    // Location filter
    if (location) {
      query.$or = [
        { "currentAddress.city": { $regex: location, $options: "i" } },
        { "currentAddress.state": { $regex: location, $options: "i" } },
        { "currentAddress.country": { $regex: location, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const totalCandidates = await Candidate.countDocuments(query);

    // Get candidates with pagination
    const candidates = await Candidate.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // For each candidate, get application count and recent applications
    const candidatesWithApplications = await Promise.all(
      candidates.map(async (candidate) => {
        const applicationCount = await Application.countDocuments({
          candidate: candidate._id,
        });

        const recentApplications = await Application.find({
          candidate: candidate._id,
        })
          .populate("job", "title company")
          .sort({ applicationDate: -1 })
          .limit(3)
          .lean();

        return {
          ...candidate,
          _id: candidate._id.toString(),
          applicationCount,
          recentApplications: recentApplications.map((app) => ({
            _id: app._id.toString(),
            jobTitle: (app.job as any)?.title,
            company: (app.job as any)?.company,
            status: app.status,
            applicationDate: (app as any).applicationDate,
          })),
        };
      })
    );

    return NextResponse.json({
      candidates: candidatesWithApplications,
      pagination: {
        total: totalCandidates,
        page,
        limit,
        pages: Math.ceil(totalCandidates / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Create new candidate
    const candidate = await Candidate.create({
      ...data,
      status: data.status || "active",
    });

    return NextResponse.json(
      {
        candidate,
        message: "Candidate created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating candidate:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create candidate" },
      { status: 500 }
    );
  }
}
