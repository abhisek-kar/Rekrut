import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import { jobAssignmentSchema } from '@/lib/validators/job';
import { canAssignJob } from '@/lib/permissions';
import Job from '@/models/Job';
import User from '@/models/User';
import Activity from '@/models/Activity';
import { notifyJobAssignment } from '@/lib/email/notifications';
import { ZodError } from 'zod';

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

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Check permission
    const hasPermission = await canAssignJob(params.id, session);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to assign this job' },
        { status: 403 }
      );
    }

    // Parse request data
    const data = await request.json();
    
    // Validate input
    try {
      jobAssignmentSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { subadminId, notifySubadmin } = data;

    // Check if job exists
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
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
    const updatedJob = await Job.findByIdAndUpdate(
      params.id,
      { 
        assignedTo: subadminId,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email');

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
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Send notification to the subadmin if requested
    if (notifySubadmin) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      try {
        await notifyJobAssignment(
          job._id.toString(),
          subadminId,
          session.user.id,
          appUrl
        );
      } catch (notificationError) {
        console.error('Failed to send assignment notification:', notificationError);
        // Don't fail the assignment if notification fails
      }
    }

    return NextResponse.json(
      { job: updatedJob, message: 'Job assigned successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assign job',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}