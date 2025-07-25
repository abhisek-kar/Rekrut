import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import { auth } from "@/auth";
import Application from "@/models/Application";
import Activity from "@/models/Activity";

// POST: Add/Create a review for an application
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
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Check if review already exists
    if (application.review) {
      return NextResponse.json(
        { error: "Review already exists. Use PUT to update." },
        { status: 409 }
      );
    }

    // Create review object
    const review = {
      rating: data.rating,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      interviewRecommendation: data.interviewRecommendation ?? true,
      feedback: data.feedback || "",
      reviewedBy: new mongoose.Types.ObjectId(session.user.id),
      reviewDate: new Date(),
    };

    // Add review to application
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          review,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate({
      path: "review.reviewedBy",
      select: "firstName lastName",
    });

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "add_review",
      entityType: "application",
      entityId: id,
      details: {
        rating: data.rating,
        recommendation: data.interviewRecommendation,
        strengthsCount: data.strengths?.length || 0,
        weaknessesCount: data.weaknesses?.length || 0,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Review added successfully",
      review: updatedApplication?.review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update existing review
export async function PUT(
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
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Check if review exists
    if (!application.review) {
      return NextResponse.json(
        { error: "Review not found. Use POST to create." },
        { status: 404 }
      );
    }

    // Update review
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          "review.rating": data.rating,
          "review.strengths": data.strengths || [],
          "review.weaknesses": data.weaknesses || [],
          "review.interviewRecommendation":
            data.interviewRecommendation ?? true,
          "review.feedback": data.feedback || "",
          "review.reviewedBy": new mongoose.Types.ObjectId(session.user.id),
          "review.reviewDate": new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate({
      path: "review.reviewedBy",
      select: "firstName lastName",
    });

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "update_review",
      entityType: "application",
      entityId: id,
      details: {
        rating: data.rating,
        recommendation: data.interviewRecommendation,
        strengthsCount: data.strengths?.length || 0,
        weaknessesCount: data.weaknesses?.length || 0,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Review updated successfully",
      review: updatedApplication?.review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete review
export async function DELETE(
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

    // Remove review from application
    const application = await Application.findByIdAndUpdate(
      id,
      {
        $unset: { review: 1 },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: "delete_review",
      entityType: "application",
      entityId: id,
      details: {
        reason: "Review deleted by user",
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get review for an application
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
        path: "review.reviewedBy",
        select: "firstName lastName",
      })
      .select("review");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      review: application.review || null,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
