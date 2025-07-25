import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import Application from "@/models/Application";
import Activity from "@/models/Activity";

// POST: Add a new note to an application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.content || !data.content.trim()) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    // Find the application
    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Create note object
    const note = {
      content: data.content.trim(),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      createdAt: new Date(),
      visibility: data.visibility || "internal",
    };

    // Add note to application
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        $push: { notes: note },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    ).populate({
      path: "notes.createdBy",
      select: "firstName lastName",
    });

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "add_note",
      entityType: "application",
      entityId: id,
      details: {
        noteLength: data.content.length,
        visibility: data.visibility || "internal",
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Note added successfully",
      note: updatedApplication?.notes?.[updatedApplication.notes.length - 1],
    });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get all notes for an application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    const application = await Application.findById(id)
      .populate({
        path: "notes.createdBy",
        select: "firstName lastName",
      })
      .select("notes");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notes: application.notes || [],
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
