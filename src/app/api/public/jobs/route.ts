import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Job from "@/models/Job";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const employmentType = searchParams.get("employmentType") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const locationType = searchParams.get("locationType") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const featured = searchParams.get("featured") || "";

    // Build query for public jobs only
    const query: Record<string, any> = {
      visibility: "public",
      status: "active",
    };

    // Build search conditions
    const searchConditions = [];

    // Search filter (title, company, or description)
    if (search) {
      searchConditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { skills: { $in: [new RegExp(search, "i")] } },
        ],
      });
    }

    // Location filter
    if (location) {
      searchConditions.push({
        $or: [
          { "location.city": { $regex: location, $options: "i" } },
          { "location.state": { $regex: location, $options: "i" } },
          { "location.country": { $regex: location, $options: "i" } },
          { company: { $regex: location, $options: "i" } },
        ],
      });
    }

    // Add search conditions to query
    if (searchConditions.length > 0) {
      query.$and = searchConditions;
    }

    // Employment type filter
    if (employmentType && employmentType !== "all") {
      query.employmentType = employmentType;
    }

    // Experience level filter
    if (experienceLevel && experienceLevel !== "all") {
      query.experienceLevel = experienceLevel;
    }

    // Location type filter
    if (locationType && locationType !== "all") {
      query["location.type"] = locationType;
    }

    // Featured filter
    if (featured === "true") {
      query.featured = true;
    }

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    if (featured === "true") {
      sortObj.featured = -1;
    }
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "_id slug publicId title company department location description skills experienceLevel employmentType salary benefits featured createdAt updatedAt applicationDeadline"
      )
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      jobs,
      pagination: {
        total: totalJobs,
        page,
        pages: totalPages,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching public jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
