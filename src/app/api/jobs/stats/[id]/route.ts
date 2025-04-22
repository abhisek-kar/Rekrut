import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Job from '@/models/Job';
import Application from '@/models/Application';

// GET: Fetch statistics for a specific job
export async function GET(
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

    // Find the job
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get applications count
    const applicationsCount = await Application.countDocuments({
      jobId: params.id
    });

    // Get applications by status
    const statusCounts = await Application.aggregate([
      { $match: { jobId: new mongoose.Types.ObjectId(params.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format status counts into an object
    const statusBreakdown = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get applications by source
    const sourceCounts = await Application.aggregate([
      { $match: { jobId: new mongoose.Types.ObjectId(params.id) } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Format source counts into an object
    const sourceBreakdown = sourceCounts.reduce((acc, curr) => {
      acc[curr._id || 'direct'] = curr.count;
      return acc;
    }, {});

    // Count hires (applications with 'hired' status)
    const hiresCount = statusBreakdown.hired || 0;

    // Get view count from job document
    const viewCount = job.viewCount || 0;

    // Calculate conversion rate (applications / views)
    const conversionRate = viewCount > 0 ? (applicationsCount / viewCount) * 100 : 0;

    // Return compiled statistics
    return NextResponse.json({
      stats: {
        views: viewCount,
        applications: applicationsCount,
        hires: hiresCount,
        shares: 0, // Placeholder for future implementation
        conversionRate: conversionRate.toFixed(2) + '%',
        statusBreakdown,
        sourceBreakdown,
        datePosted: job.createdAt,
        daysActive: Math.ceil((new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 3600 * 24))
      }
    });
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job statistics' },
      { status: 500 }
    );
  }
}