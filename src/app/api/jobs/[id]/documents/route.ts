import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import { uploadFile, getFileUrl } from "@/lib/aws/s3";
import Job from "@/models/Job";
import Activity from "@/models/Activity";
import User from "@/models/User";

// Define document model schema (can be moved to models directory)
const DocumentSchema = new mongoose.Schema({
  name: String,
  fileName: String,
  fileKey: String, // S3 key
  fileSize: Number,
  mimeType: String,
  category: {
    type: String,
    enum: ["description", "requirements", "compensation", "other"],
    default: "other",
  },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadDate: { type: Date, default: Date.now },
});

// Get Document model (create if not exists)
const Document =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);

// GET: Fetch documents for a job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Check if job exists
    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Fetch documents for this job
    const documents = await Document.find({ jobId: params.id })
      .populate("uploadedBy", "firstName lastName email profilePhoto")
      .sort({ uploadDate: -1 });

    // Generate signed URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const fileUrl = await getFileUrl(doc.fileKey);
        return {
          ...doc.toObject(),
          fileUrl,
        };
      })
    );

    return NextResponse.json({ documents: documentsWithUrls });
  } catch (error) {
    console.error("Error fetching job documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST: Upload a new document for a job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Check if job exists
    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = (formData.get("name") as string) || file.name.split(".")[0];
    const category = (formData.get("category") as string) || "other";

    // Generate unique file key
    const fileExtension = file.name.split(".").pop() || "";
    const fileKey = `jobs/${params.id}/documents/${uuidv4()}.${fileExtension}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file to S3
    const fileUrl = await uploadFile(buffer, fileKey, file.type);

    // Create document record in database
    const document = await Document.create({
      name,
      fileName: file.name,
      fileKey,
      fileSize: file.size,
      mimeType: file.type,
      category,
      jobId: params.id,
      uploadedBy: session.user.id,
    });

    // Populate uploadedBy field
    await document.populate(
      "uploadedBy",
      "firstName lastName email profilePhoto"
    );

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "upload_document",
      entityType: "job",
      entityId: params.id,
      details: {
        jobTitle: job.title,
        documentName: name,
        fileName: file.name,
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.ip,
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(
      {
        document: {
          ...document.toObject(),
          fileUrl,
        },
        message: "Document uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
