import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { authOptions } from "@/lib/auth/nextauth";
import Candidate from "@/models/Candidate";
import Application from "@/models/Application";
import Job from "@/models/Job";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify authentication and role
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure only SubAdmins can access this endpoint
    if (session.user.role !== "subadmin") {
      return NextResponse.json(
        { error: "Forbidden. Only SubAdmins can access this endpoint." },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skills = searchParams.get("skills") || "";
    const experience = searchParams.get("experience") || "";
    const location = searchParams.get("location") || "";
    const applicationStatus = searchParams.get("applicationStatus") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // First, get all jobs assigned to this SubAdmin
    const assignedJobs = await Job.find({
      assignedTo: new mongoose.Types.ObjectId(session.user.id),
    })
      .select("_id")
      .lean();

    const assignedJobIds = assignedJobs.map((job) => job._id);

    if (assignedJobIds.length === 0) {
      // SubAdmin has no assigned jobs, return empty result
      return NextResponse.json({
        candidates: [],
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          blacklisted: 0,
          byApplicationStatus: {
            applied: 0,
            screening: 0,
            interview_scheduled: 0,
            interviewed: 0,
            offered: 0,
            hired: 0,
            rejected: 0,
          },
        },
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      });
    }

    // Get candidates who have applied to jobs assigned to this SubAdmin
    const applications = await Application.find({
      job: { $in: assignedJobIds },
    }).distinct("candidate");

    if (applications.length === 0) {
      return NextResponse.json({
        candidates: [],
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          blacklisted: 0,
          byApplicationStatus: {
            applied: 0,
            screening: 0,
            interview_scheduled: 0,
            interviewed: 0,
            offered: 0,
            hired: 0,
            rejected: 0,
          },
        },
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      });
    }

    // Build query for candidates who have applied to assigned jobs
    const query: Record<string, any> = {
      _id: { $in: applications },
    };

    // Additional filters
    if (status && status !== "all") {
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
    let candidates = await Candidate.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // For each candidate, get their applications to this SubAdmin's jobs
    const candidatesWithApplications = await Promise.all(
      candidates.map(async (candidate) => {
        // Get applications for this candidate to this SubAdmin's jobs
        const candidateApplications = await Application.find({
          candidate: candidate._id,
          job: { $in: assignedJobIds },
        })
          .populate("job", "title company")
          .sort({ applicationDate: -1 })
          .lean();

        // Filter by application status if specified
        let filteredApplications = candidateApplications;
        if (applicationStatus && applicationStatus !== "all") {
          filteredApplications = candidateApplications.filter(
            (app) => app.status === applicationStatus
          );
        }

        // Get the most recent application status
        const latestApplication = candidateApplications[0];

        return {
          ...candidate,
          _id: candidate._id.toString(),
          applicationCount: candidateApplications.length,
          latestApplicationStatus: latestApplication?.status || "unknown",
          latestApplicationDate: (latestApplication as any)?.applicationDate,
          applications: filteredApplications.map((app) => ({
            _id: app._id.toString(),
            jobId: app.job._id.toString(),
            jobTitle: (app.job as any).title,
            company: (app.job as any).company,
            status: (app as any).status,
            applicationDate: (app as any).applicationDate,
            matchingScore: (app as any).matchingScore,
          })),
        };
      })
    );

    // Filter by application status if specified
    let filteredCandidates = candidatesWithApplications;
    if (applicationStatus && applicationStatus !== "all") {
      filteredCandidates = candidatesWithApplications.filter(
        (candidate) => candidate.applications.length > 0
      );
    }

    // Calculate statistics
    const allCandidatesInJobs = await Candidate.find({
      _id: { $in: applications },
    }).lean();

    const stats = {
      total: allCandidatesInJobs.length,
      active: allCandidatesInJobs.filter((c) => c.status === "active").length,
      inactive: allCandidatesInJobs.filter((c) => c.status === "inactive")
        .length,
      blacklisted: allCandidatesInJobs.filter((c) => c.status === "blacklisted")
        .length,
      byApplicationStatus: {
        applied: 0,
        screening: 0,
        interview_scheduled: 0,
        interviewed: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
      },
    };

    // Get application status counts
    const applicationStatusCounts = await Application.aggregate([
      { $match: { job: { $in: assignedJobIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    applicationStatusCounts.forEach(({ _id, count }) => {
      if (stats.byApplicationStatus.hasOwnProperty(_id)) {
        stats.byApplicationStatus[
          _id as keyof typeof stats.byApplicationStatus
        ] = count;
      }
    });

    return NextResponse.json({
      candidates: filteredCandidates,
      stats,
      pagination: {
        total: filteredCandidates.length,
        page,
        limit,
        pages: Math.ceil(filteredCandidates.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching SubAdmin candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
