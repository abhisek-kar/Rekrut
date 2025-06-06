import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Job from '@/models/Job';
import Activity from '@/models/Activity';
import User from '@/models/User';

// GET: Fetch a specific job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Find the job and populate creator and assignee
    const job = await Job.findById(params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PUT: Update a job by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Parse job data from request
    const data = await request.json();

    // Find job and update
    const job = await Job.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Log the activity
    await Activity.create({
      userId: session.user.id,
      action: 'update',
      entityType: 'job',
      entityId: job._id,
      details: { jobTitle: job.title },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      { job, message: 'Job updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating job:', error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a job by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // First check if job exists
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Archive instead of physically deleting
    job.status = 'archived';
    await job.save();

    // Log the activity
    await Activity.create({
      userId: session.user.id,
      action: 'delete',
      entityType: 'job',
      entityId: job._id,
      details: { jobTitle: job.title },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      { success: true, message: 'Job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}