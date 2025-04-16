import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Job from '@/models/Job';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'active';
    const createdBy = searchParams.get('createdBy') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: any = {};
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Search filter (title, company, or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Created by filter
    if (createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(createdBy);
    }
    
    // Assigned to filter
    if (assignedTo) {
      query.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }
    
    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);
    
    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    
    return NextResponse.json({
      jobs,
      pagination: {
        total: totalJobs,
        page,
        limit,
        pages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    // Parse job data from request
    const data = await request.json();
    
    // Add the current user as creator
    data.createdBy = session.user.id;
    
    // Create new job
    const job = await Job.create(data);
    
    return NextResponse.json(
      { job, message: 'Job created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
