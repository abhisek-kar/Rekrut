import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Ensure all models are registered
    const JobModel = Job;
    const UserModel = User;

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Find application without population first to debug
    const application = await Application.findById(id).lean();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Transform the data for frontend consumption
    const transformedApplication = {
      _id: application._id.toString(),
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      status: application.status,
      source: application.source,
      matchScore: application.matchScore,

      // Candidate details (embedded data, no separate _id)
      candidate: application.candidate,

      // Job details
      job: application.job,

      // Status history
      statusHistory: application.statusHistory?.map((history: any) => ({
        status: history.status,
        date: history.date,
        updatedBy: history.updatedBy
          ? {
              firstName: history.updatedBy.firstName,
              lastName: history.updatedBy.lastName,
            }
          : null,
        reason: history.reason,
      })),

      // Notes
      notes: application.notes?.map((note: any) => ({
        _id: note._id.toString(),
        content: note.content,
        createdBy: {
          firstName: note.createdBy.firstName,
          lastName: note.createdBy.lastName,
        },
        createdAt: note.createdAt,
        visibility: note.visibility,
      })),

      // Interviews
      interviews: application.interviews?.map((interview: any) => ({
        _id: interview._id.toString(),
        dateTime: interview.dateTime,
        duration: interview.duration,
        type: interview.type,
        interviewers: interview.interviewers?.map((interviewer: any) => ({
          _id: interviewer._id.toString(),
          firstName: interviewer.firstName,
          lastName: interviewer.lastName,
          email: interviewer.email,
        })),
        location: interview.location,
        videoLink: interview.videoLink,
        notes: interview.notes,
        status: interview.status,
      })),

      // Review
      review: application.review
        ? {
            rating: application.review.rating,
            strengths: application.review.strengths,
            weaknesses: application.review.weaknesses,
            interviewRecommendation: application.review.interviewRecommendation,
            feedback: application.review.feedback,
            reviewedBy: application.review.reviewedBy
              ? {
                  firstName: (application.review.reviewedBy as any).firstName,
                  lastName: (application.review.reviewedBy as any).lastName,
                }
              : null,
            reviewDate: application.review.reviewDate,
          }
        : null,

      // Match details
      matchDetails: application.matchDetails,

      // File attachments
      // resume: application.resume ?? null,
      // coverLetter: application.coverLetter ?? null,
      // additionalDocuments: application.additionalDocuments ?? null,
      resume: null,
      coverLetter: null,
      additionalDocuments: null,

      // Custom fields and answers
      customFields: application.customFields,
      answers: application.answers,

      // Referral info
      referral: application.referral,
    };

    return NextResponse.json({
      application: transformedApplication,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      );
    }

    // Update application
    const updatedApplication = await Application.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete application
    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
