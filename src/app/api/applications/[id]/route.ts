import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Application from "@/models/Application";
import Candidate from "@/models/Candidate";
import Job from "@/models/Job";
import User from "@/models/User";

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

    // Find application with all related data
    const application = await Application.findById(id)
      .populate({
        path: "candidate",
        select:
          "firstName lastName email phone profilePhoto address currentPosition employmentHistory education skills",
      })
      .populate({
        path: "job",
        select: "title company department location",
      })
      .populate({
        path: "notes.createdBy",
        select: "firstName lastName",
      })
      .populate({
        path: "interviews.interviewers",
        select: "firstName lastName email",
      })
      .populate({
        path: "review.reviewedBy",
        select: "firstName lastName",
      })
      .populate({
        path: "statusHistory.updatedBy",
        select: "firstName lastName",
      })
      .lean();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Transform the data for frontend consumption
    const transformedApplication = {
      _id: application._id.toString(),
      applicationDate: application.createdAt,
      status: application.status,
      source: application.source,
      matchingScore: application.matchScore,

      // Candidate details
      candidate: {
        _id: (application.candidate as any)._id.toString(),
        firstName: (application.candidate as any).firstName,
        lastName: (application.candidate as any).lastName,
        email: (application.candidate as any).email,
        phone: (application.candidate as any).phone,
        profilePhoto: (application.candidate as any).profilePhoto,
        address: (application.candidate as any).address,
        currentPosition: (application.candidate as any).currentPosition,
        employmentHistory: (application.candidate as any).employmentHistory,
        education: (application.candidate as any).education,
        skills: (application.candidate as any).skills,
      },

      // Job details
      job: {
        _id: (application.job as any)._id.toString(),
        title: (application.job as any).title,
        company: (application.job as any).company,
        department: (application.job as any).department,
        location: (application.job as any).location,
      },

      // Documents
      resume: application.resume,
      coverLetter: application.coverLetter,
      additionalDocuments: application.additionalDocuments,

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
