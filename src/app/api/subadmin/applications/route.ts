import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Application from '@/models/Application';
import Job from '@/models/Job';
import Candidate from '@/models/Candidate';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get session to verify authentication and role
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure only SubAdmins can access this endpoint
    if (session.user.role !== 'subadmin') {
      return NextResponse.json(
        { error: 'Forbidden. Only SubAdmins can access this endpoint.' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const jobId = searchParams.get('jobId') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'applicationDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const summary = searchParams.get('summary') === 'true';
    
    // First, get all jobs assigned to this SubAdmin
    const assignedJobs = await Job.find({ 
      assignedTo: new mongoose.Types.ObjectId(session.user.id) 
    }).select('_id').lean();
    
    const assignedJobIds = assignedJobs.map(job => job._id);
    
    if (assignedJobIds.length === 0) {
      // SubAdmin has no assigned jobs, return empty result
      return NextResponse.json({
        applications: [],
        counts: {
          all: 0,
          applied: 0,
          screening: 0,
          interview_scheduled: 0,
          interviewed: 0,
          offered: 0,
          hired: 0,
          rejected: 0,
        },
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      });
    }
    
    // Build query - only applications for jobs assigned to this SubAdmin
    const query: Record<string, any> = {
      job: { $in: assignedJobIds }
    };
    
    // Additional filters
    if (jobId) {
      query.job = new mongoose.Types.ObjectId(jobId);
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // If requesting summary data for a specific job
    if (summary && jobId) {
      const applications = await Application.find({ job: new mongoose.Types.ObjectId(jobId) })
        .populate('candidate', 'firstName lastName email')
        .sort({ applicationDate: -1 })
        .limit(5)
        .lean();
      
      const statusCounts = await Application.aggregate([
        { $match: { job: new mongoose.Types.ObjectId(jobId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      const counts = {
        total: 0,
        byStatus: {
          applied: 0,
          screening: 0,
          interview_scheduled: 0,
          interviewed: 0,
          offered: 0,
          hired: 0,
          rejected: 0,
        },
        recent: applications.map(app => ({
          _id: app._id.toString(),
          candidate: {
            firstName: app.candidate.firstName,
            lastName: app.candidate.lastName,
            email: app.candidate.email,
          },
          status: app.status,
          applicationDate: app.applicationDate,
        }))
      };
      
      statusCounts.forEach(({ _id, count }) => {
        counts.total += count;
        if (counts.byStatus.hasOwnProperty(_id)) {
          counts.byStatus[_id as keyof typeof counts.byStatus] = count;
        }
      });
      
      return NextResponse.json({ summary: counts });
    }
    
    // Search filter (on candidate's name or email)
    if (search) {
      const candidates = await Candidate.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();
      
      if (candidates.length > 0) {
        query.candidate = { $in: candidates.map(c => c._id) };
      } else {
        // No candidates match, return empty result
        return NextResponse.json({
          applications: [],
          counts: {
            all: 0,
            applied: 0,
            screening: 0,
            interview_scheduled: 0,
            interviewed: 0,
            offered: 0,
            hired: 0,
            rejected: 0,
          },
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0
          }
        });
      }
    }
    
    // Get total count for pagination
    const totalApplications = await Application.countDocuments(query);
    
    // Get applications with pagination
    let applications = await Application.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('candidate', 'firstName lastName email profilePhoto')
      .populate('job', 'title company')
      .lean();
    
    // Transform to expected format
    const formattedApplications = applications.map(app => ({
      _id: app._id.toString(),
      applicationDate: app.applicationDate,
      status: app.status,
      source: app.source,
      matchingScore: app.matchingScore,
      resume: app.resume,
      coverLetter: app.coverLetter,
      job: {
        _id: app.job._id.toString(),
        title: app.job.title,
        company: app.job.company
      },
      candidate: {
        _id: app.candidate._id.toString(),
        firstName: app.candidate.firstName,
        lastName: app.candidate.lastName,
        email: app.candidate.email,
        profilePhoto: app.candidate.profilePhoto
      }
    }));
    
    // Get status counts for all applications in assigned jobs
    const allApplicationsQuery = { job: { $in: assignedJobIds } };
    const statusCounts = await Application.aggregate([
      { $match: allApplicationsQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const counts = {
      all: 0,
      applied: 0,
      screening: 0,
      interview_scheduled: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };
    
    statusCounts.forEach(({ _id, count }) => {
      counts.all += count;
      if (counts.hasOwnProperty(_id)) {
        counts[_id as keyof typeof counts] = count;
      }
    });
    
    return NextResponse.json({
      applications: formattedApplications,
      counts,
      pagination: {
        total: totalApplications,
        page,
        limit,
        pages: Math.ceil(totalApplications / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching SubAdmin applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}