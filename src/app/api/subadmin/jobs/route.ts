import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Job from '@/models/Job';
import Application from '@/models/Application';
import User from '@/models/User';

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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Advanced filter parameters
    const department = searchParams.get('department') || '';
    const employmentType = searchParams.get('employmentType') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const locationType = searchParams.get('locationType') || '';
    const visibility = searchParams.get('visibility') || '';
    const featured = searchParams.get('featured') || '';
    
    // Build query - only show jobs assigned to this SubAdmin
    const query: Record<string, unknown> = {
      assignedTo: new mongoose.Types.ObjectId(session.user.id)
    };
    
    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = 'published';
      } else {
        query.status = status;
      }
    }
    
    // Search filter (title, company, or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Advanced filters
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (employmentType && employmentType !== 'all') {
      query.employmentType = employmentType;
    }
    
    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }
    
    if (locationType && locationType !== 'all') {
      query['location.type'] = locationType;
    }
    
    if (visibility && visibility !== 'all') {
      query.visibility = visibility;
    }
    
    if (featured && featured !== 'all') {
      query.featured = featured === 'true';
    }
    
    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);
    
    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .lean();

    // Get application counts for each job
    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCounts = await Application.aggregate([
          { $match: { job: job._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const counts = {
          total: 0,
          new: 0,
          interviewing: 0,
          offered: 0,
          hired: 0
        };

        applicationCounts.forEach(({ _id, count }) => {
          counts.total += count;
          switch (_id) {
            case 'applied':
              counts.new = count;
              break;
            case 'interview_scheduled':
            case 'interviewed':
              counts.interviewing += count;
              break;
            case 'offered':
              counts.offered = count;
              break;
            case 'hired':
              counts.hired = count;
              break;
          }
        });

        return {
          ...job,
          applicationCounts: counts
        };
      })
    );

    // Get status counts for this SubAdmin
    const statusCounts = {
      all: await Job.countDocuments({ assignedTo: session.user.id }),
      active: await Job.countDocuments({ assignedTo: session.user.id, status: 'active' }),
      draft: await Job.countDocuments({ assignedTo: session.user.id, status: 'draft' }),
      closed: await Job.countDocuments({ assignedTo: session.user.id, status: 'closed' }),
      archived: await Job.countDocuments({ assignedTo: session.user.id, status: 'archived' }),
    };
    
    return NextResponse.json({
      jobs: jobsWithApplicationCounts,
      counts: statusCounts,
      pagination: {
        total: totalJobs,
        page,
        limit,
        pages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching SubAdmin jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}