import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Job from '@/models/Job';
import User from '@/models/User';
import Activity from '@/models/Activity';
import Notification from '@/models/Notification';

// PUT: Assign job to a SubAdmin
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

    // Check if user is admin (only admins can assign jobs)
    const currentUser = await User.findById(session.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can assign jobs' },
        { status: 403 }
      );
    }

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Parse request data
    const { subadminId, notifySubadmin } = await request.json();

    // Validate subadminId
    if (!mongoose.Types.ObjectId.isValid(subadminId)) {
      return NextResponse.json(
        { error: 'Invalid subadmin ID' },
        { status: 400 }
      );
    }

    // Check if subadmin exists and is actually a subadmin
    const subadmin = await User.findById(subadminId);
    if (!subadmin || subadmin.role !== 'subadmin') {
      return NextResponse.json(
        { error: 'SubAdmin not found' },
        { status: 404 }
      );
    }

    // Find job and update
    const job = await Job.findByIdAndUpdate(
      params.id,
      { 
        assignedTo: subadminId,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Log the activity
    await Activity.create({
      userId: session.user.id,
      action: 'job_assignment',
      entityType: 'job',
      entityId: job._id,
      details: { 
        jobTitle: job.title,
        assignedTo: subadminId,
        assigneeName: `${subadmin.firstName} ${subadmin.lastName}`
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Create notification for the subadmin if requested
    if (notifySubadmin) {
      await Notification.create({
        userId: subadminId,
        type: 'assignment',
        title: 'New Job Assignment',
        message: `You have been assigned to manage the "${job.title}" job`,
        read: false,
        link: `/jobs/${job._id}`,
        relatedId: job._id
      });
    }

    return NextResponse.json(
      { job, message: 'Job assigned successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning job:', error);
    return NextResponse.json(
      { error: 'Failed to assign job' },
      { status: 500 }
    );
  }
}