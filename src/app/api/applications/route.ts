import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { randomBytes } from "crypto";
import { uploadToS3 } from "@/lib/aws/s3/index";

// Helper function to generate S3 keys
function generateS3Key(directory: string, fileName: string): string {
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${directory}/${timestamp}-${uniqueId}-${sanitizedFileName}`;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const jobId = searchParams.get("jobId") || "";
    const candidateId = searchParams.get("candidateId") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "applicationDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Advanced filter parameters
    const source = searchParams.get("source") || "";
    const assignedTo = searchParams.get("assignedTo") || "";
    const matchScore = searchParams.get("matchScore") || "";
    const interviewStatus = searchParams.get("interviewStatus") || "";
    const hasReview = searchParams.get("hasReview") || "";
    const rating = searchParams.get("rating") || "";
    const dateRange = searchParams.get("dateRange") || "";
    const jobFilter = searchParams.get("job") || ""; // Job filter from dropdown

    // Build query
    const query: Record<string, unknown> = {};

    // Job filter - handle both jobId (from URL/props) and job (from filter dropdown)
    let internalJobId: mongoose.Types.ObjectId | null = null;

    if (jobId) {
      // Convert slug/publicId to internal _id like in POST route
      let job: any;
      if (jobId.includes("-") && jobId.length > 20) {
        // Likely a slug
        job = await Job.findOne({ slug: jobId });
      } else if (jobId.length === 36 && jobId.includes("-")) {
        // Likely a publicId (UUID format)
        job = await Job.findOne({ publicId: jobId });
      } else if (mongoose.Types.ObjectId.isValid(jobId)) {
        // Legacy ObjectId
        job = await Job.findById(jobId);
      }

      if (job) {
        internalJobId = job._id;
      }
    } else if (jobFilter && jobFilter !== "all") {
      // Job filter from dropdown - this should already be an ObjectId
      if (mongoose.Types.ObjectId.isValid(jobFilter)) {
        internalJobId = new mongoose.Types.ObjectId(jobFilter);
      }
    }

    if (internalJobId) {
      query.job = internalJobId;
    }

    // Candidate filter - since candidate is embedded, we search by email
    if (candidateId) {
      // For MVP, we'll treat candidateId as email since we don't have separate candidate records
      query["candidate.email"] = candidateId;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Advanced filters

    // Source filter
    if (source && source !== "all") {
      query.source = source;
    }

    // Match score filter
    if (matchScore && matchScore !== "all") {
      switch (matchScore) {
        case "high":
          query.matchScore = { $gte: 80 };
          break;
        case "medium":
          query.matchScore = { $gte: 60, $lt: 80 };
          break;
        case "low":
          query.matchScore = { $lt: 60 };
          break;
      }
    }

    // Interview status filter
    if (interviewStatus && interviewStatus !== "all") {
      if (interviewStatus === "no_interview") {
        query.interviews = { $size: 0 };
      } else {
        query["interviews.status"] = interviewStatus;
      }
    }

    // Review status filter
    if (hasReview && hasReview !== "all") {
      if (hasReview === "reviewed") {
        query.review = { $exists: true };
      } else {
        query.review = { $exists: false };
      }
    }

    // Rating filter (only if reviewed)
    if (rating && rating !== "all" && hasReview === "reviewed") {
      query["review.rating"] = parseInt(rating);
    }

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          query.createdAt = { $gte: startDate };
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          query.createdAt = { $gte: startDate };
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          query.createdAt = { $gte: startDate };
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          query.createdAt = { $gte: startDate };
          break;
      }
    }

    // Review status filter
    if (hasReview) {
      query.hasReview = hasReview === "true";
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Date range filter (for application date)
    if (dateRange) {
      const [startDate, endDate] = dateRange
        .split(",")
        .map((dateStr) => new Date(dateStr.trim()));
      query.applicationDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Search filter (search within embedded candidate data)
    if (search) {
      query.$or = [
        { "candidate.firstName": { $regex: search, $options: "i" } },
        { "candidate.lastName": { $regex: search, $options: "i" } },
        { "candidate.email": { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const totalApplications = await Application.countDocuments(query);

    // Determine sort field
    let sortField = sortBy;

    // Handle nested sort fields
    if (sortBy === "candidate.lastName") {
      // We'll handle this by populating and sorting in memory
      sortField = "applicationDate"; // Default sort for now
    }

    // Get applications with pagination
    const rawApplications = await Application.find(query)
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("job", "title company")
      .lean();

    // Transform to expected format
    let applications = rawApplications.map((app: any) => ({
      _id: app._id.toString(),
      applicationDate: app.createdAt,
      status: app.status,
      source: app.source,
      matchingScore: app.matchScore,
      job: {
        _id: app.job._id.toString(),
        title: app.job.title,
        company: app.job.company,
      },
      candidate: {
        firstName: app.candidate.firstName,
        lastName: app.candidate.lastName,
        email: app.candidate.email,
        phone: app.candidate.phone,
        location: app.candidate.location,
      },
    }));

    // Handle sorting by candidate name if needed
    if (sortBy === "candidate.lastName") {
      applications.sort((a, b) => {
        const lastNameA = a.candidate.lastName.toLowerCase();
        const lastNameB = b.candidate.lastName.toLowerCase();

        if (sortOrder === "asc") {
          return lastNameA.localeCompare(lastNameB);
        } else {
          return lastNameB.localeCompare(lastNameA);
        }
      });
    }

    return NextResponse.json({
      applications,
      pagination: {
        total: totalApplications,
        page,
        limit,
        pages: Math.ceil(totalApplications / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const applicationDataStr = formData.get("applicationData") as string;

    if (!jobId || !applicationDataStr) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const applicationData = JSON.parse(applicationDataStr);

    // Debug: Log the received application data
    console.log(
      "Received application data:",
      JSON.stringify(applicationData, null, 2)
    );
    console.log("Current Address:", applicationData.currentAddress);
    console.log("Permanent Address:", applicationData.permanentAddress);
    console.log("Is Same as Permanent:", applicationData.isSameAsPermanent);
    console.log("Professional Details:", {
      currentRole: applicationData.currentRole,
      currentCompany: applicationData.currentCompany,
      experienceLevel: applicationData.experienceLevel,
      currentCTC: applicationData.currentCTC,
      currentCTCCurrency: applicationData.currentCTCCurrency,
      expectedCTC: applicationData.expectedCTC,
      expectedCTCCurrency: applicationData.expectedCTCCurrency,
      noticePeriod: applicationData.noticePeriod,
      skills: applicationData.skills,
    });
    console.log("Preferences:", {
      availableStartDate: applicationData.availableStartDate,
      willingToRelocate: applicationData.willingToRelocate,
      preferredWorkType: applicationData.preferredWorkType,
      additionalMessage: applicationData.additionalMessage,
    });

    // Validate required fields
    if (
      !applicationData.firstName ||
      !applicationData.lastName ||
      !applicationData.email
    ) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    // Find job by slug/publicId/ObjectId and get the internal _id
    let job;
    if (jobId.includes("-") && jobId.length > 20) {
      // Likely a slug
      job = await Job.findOne({ slug: jobId });
    } else if (jobId.length === 36 && jobId.includes("-")) {
      // Likely a UUID (publicId)
      job = await Job.findOne({ publicId: jobId });
    } else if (mongoose.Types.ObjectId.isValid(jobId)) {
      // Legacy ObjectId support
      job = await Job.findById(jobId);
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Use the internal _id for database operations
    const internalJobId = job._id;

    // Validate that required documents are provided
    const requiredDocuments = job.requiredDocuments || [];
    console.log("Job required documents:", requiredDocuments);

    // If no specific requirements, default to requiring at least one document
    if (requiredDocuments.length === 0) {
      // Check if at least one document is uploaded
      const hasAnyDocument = Array.from(formData.keys()).some(
        (key) =>
          key !== "jobId" &&
          key !== "applicationData" &&
          formData.get(key) instanceof File
      );

      if (!hasAnyDocument) {
        return NextResponse.json(
          {
            error:
              "At least one document is required. Please upload your resume or other relevant documents.",
          },
          { status: 400 }
        );
      }
    } else {
      // Check if all required documents are present
      const missingDocuments = requiredDocuments.filter((docType) => {
        const file = formData.get(docType) as File;
        return !file || file.size === 0;
      });

      if (missingDocuments.length > 0) {
        return NextResponse.json(
          {
            error: `Missing required documents: ${missingDocuments.join(
              ", "
            )}. Please upload all required documents.`,
            missingDocuments,
          },
          { status: 400 }
        );
      }
    }

    // Check if application already exists for this job and email
    const existingApplication = await Application.findOne({
      job: internalJobId,
      "candidate.email": applicationData.email,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this position" },
        { status: 409 }
      );
    }

    // Handle file uploads to S3 - Dynamic documents based on job requirements
    const documents: any = {};
    const documentsToProcess =
      requiredDocuments.length > 0
        ? requiredDocuments
        : Array.from(formData.keys()).filter(
            (key) =>
              key !== "jobId" &&
              key !== "applicationData" &&
              formData.get(key) instanceof File
          );

    try {
      for (const documentType of documentsToProcess) {
        const file = formData.get(documentType) as File;
        if (file && file.size > 0) {
          console.log(
            `Uploading ${documentType}: ${file.name}, size: ${file.size}`
          );

          // Determine S3 directory based on document type
          let s3Directory = "applications/documents";
          const normalizedType = documentType.toLowerCase();

          if (
            normalizedType.includes("resume") ||
            normalizedType.includes("cv")
          ) {
            s3Directory = "applications/resumes";
          } else if (
            normalizedType.includes("cover") ||
            normalizedType.includes("letter")
          ) {
            s3Directory = "applications/cover-letters";
          } else if (
            normalizedType.includes("portfolio") ||
            normalizedType.includes("sample")
          ) {
            s3Directory = "applications/portfolio";
          } else if (normalizedType.includes("certificate")) {
            s3Directory = "applications/certificates";
          } else if (normalizedType.includes("transcript")) {
            s3Directory = "applications/transcripts";
          }

          const documentKey = generateS3Key(s3Directory, file.name);
          const documentUrl = await uploadToS3(file, documentKey);

          documents[documentType] = {
            filename: file.name,
            url: documentUrl,
            documentType: documentType,
          };

          console.log(`${documentType} uploaded successfully: ${documentUrl}`);
        }
      }
    } catch (uploadError) {
      console.error("File upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload files. Please try again." },
        { status: 500 }
      );
    }

    // Create application with embedded candidate data
    const application = new Application({
      job: internalJobId,
      candidate: {
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        location: applicationData.preferredLocation,
        linkedinProfile: applicationData.linkedinProfile,
        portfolioWebsite: applicationData.portfolioWebsite,
        currentJobTitle: applicationData.currentRole,
        currentCompany: applicationData.currentCompany,
        employmentStatus: "employed", // Default value
        experienceLevel: applicationData.experienceLevel,
        currentSalary: applicationData.currentCTC,
        currentSalaryCurrency: applicationData.currentCTCCurrency || "INR",
        expectedSalary: applicationData.expectedCTC,
        expectedSalaryCurrency: applicationData.expectedCTCCurrency || "INR",
        noticePeriod: applicationData.noticePeriod,
        availabilityToStart: applicationData.availableStartDate,
        preferredWorkArrangement: applicationData.preferredWorkType,
        skills: applicationData.skills || [],
        currentAddress: applicationData.currentAddress,
        permanentAddress: applicationData.isSameAsPermanent
          ? applicationData.currentAddress
          : applicationData.permanentAddress,
        willingToRelocate: applicationData.willingToRelocate,
        additionalComments: applicationData.additionalMessage,
      },
      status: "applied",
      statusHistory: [
        {
          status: "applied",
          date: new Date(),
          reason: "Application submitted via website",
        },
      ],
      documents: documents, // Use dynamic documents structure
      source: "website",
      // Only store custom screening question answers here, not standard form fields
      answers: {},
    });

    // Debug: Log the application object before saving
    console.log(
      "Application object before save:",
      JSON.stringify(application.toObject(), null, 2)
    );

    await application.save();

    // Generate a tracking token for the application
    const trackingToken = randomBytes(32).toString("hex");

    // TODO: In a real implementation, you would:
    // 1. Upload files to AWS S3 or similar storage
    // 2. Send confirmation email to candidate
    // 3. Send notification to hiring team
    // 4. Store tracking token in database for application status tracking

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId: application._id,
        token: trackingToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating application:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Validation errors:", error.errors);
      return NextResponse.json(
        {
          error: "Invalid application data",
          details: error.message,
          validationErrors: Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to submit application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
