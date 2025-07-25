import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import Application from "@/models/Application";
import Activity from "@/models/Activity";

// PUT: Update a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    await dbConnect();

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(noteId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const data = await request.json();

    if (!data.content || !data.content.trim()) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    // Find and update the specific note
    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        "notes._id": noteId,
      },
      {
        $set: {
          "notes.$.content": data.content.trim(),
          "notes.$.visibility": data.visibility || "internal",
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate({
      path: "notes.createdBy",
      select: "firstName lastName",
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application or note not found" },
        { status: 404 }
      );
    }

    // Check if user can edit this note (only the creator or admin)
    const note = application.notes?.find(
      (note: any) => note._id.toString() === noteId
    );
    if (
      note &&
      note.createdBy._id.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You can only edit your own notes" },
        { status: 403 }
      );
    }

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "update_note",
      entityType: "application",
      entityId: id,
      details: {
        noteId,
        visibility: data.visibility || "internal",
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    const updatedNote = application.notes?.find(
      (note: any) => note._id.toString() === noteId
    );

    return NextResponse.json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    await dbConnect();

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(noteId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // First check if user can delete this note
    const application = await Application.findById(id).populate(
      "notes.createdBy",
      "_id"
    );
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const note = application.notes?.find(
      (note: any) => note._id.toString() === noteId
    );
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Check permissions (only creator or admin can delete)
    if (
      note.createdBy._id.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You can only delete your own notes" },
        { status: 403 }
      );
    }

    // Remove the note from the application
    await Application.findByIdAndUpdate(
      id,
      {
        $pull: { notes: { _id: noteId } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "delete_note",
      entityType: "application",
      entityId: id,
      details: {
        noteId,
        reason: "Note deleted by user",
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
