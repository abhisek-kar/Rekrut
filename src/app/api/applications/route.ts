import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import Application from '@/models/Application';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const jobId = searchParams.get('jobId') || '';
    const candidateId = searchParams.get('candidateId') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'applicationDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: { 
      jobId?: mongoose.Types.ObjectId; 
      candidateId?: mongoose.Types.ObjectId; 
      status?: string;
    } = {};
    
    // Job filter
    if (jobId) {
      query.jobId = new mongoose.Types.ObjectId(jobId);
    }
    
    // Candidate filter
    if (candidateId) {
      query.candidateId = new mongoose.Types.ObjectId(candidateId);
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Search filter (on related candidate's name or email)
    if (search) {
      // First find candidates matching the search
      const candidates = await mongoose.model('Candidate').find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      if (candidates.length > 0) {
        query.candidateId = { $in: candidates.map(c => c._id) };
      } else {
        // No candidates match, return empty result
        return NextResponse.json({
          applications: [],
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
    
    // Determine sort field
    let sortField = sortBy;
    
    // Handle nested sort fields
    if (sortBy === 'candidate.lastName') {
      // We'll handle this by populating and sorting in memory
      sortField = 'applicationDate'; // Default sort for now
    }
    
    // Get applications with pagination
    let applications = await Application.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('candidateId', 'firstName lastName email profilePhoto')
      .populate('jobId', 'title company')
      .lean();
      
    // Transform to expected format
    applications = applications.map(app => ({
      _id: app._id.toString(),
      applicationDate: app.applicationDate,
      status: app.status,
      source: app.source,
      matchingScore: app.matchingScore,
      job: {
        _id: app.jobId._id.toString(),
        title: app.jobId.title,
        company: app.jobId.company
      },
      candidate: {
        _id: app.candidateId._id.toString(),
        firstName: app.candidateId.firstName,
        lastName: app.candidateId.lastName,
        email: app.candidateId.email,
        profilePhoto: app.candidateId.profilePhoto
      }
    }));
    
    // Handle sorting by candidate name if needed
    if (sortBy === 'candidate.lastName') {
      applications.sort((a, b) => {
        const lastNameA = a.candidate.lastName.toLowerCase();
        const lastNameB = b.candidate.lastName.toLowerCase();
        
        if (sortOrder === 'asc') {
          return lastNameA.localeCompare(lastNameB);
        } else {
          return lastNameB.localeCompare(lastNameA);
        }
      });
    }
    
    return NextResponse.json({
      applications,
      pagination: {
        total: totalApplications,
        page,
        limit,
        pages: Math.ceil(totalApplications / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
