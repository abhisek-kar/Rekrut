import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import Job from '@/models/Job';
import User from '@/models/User';

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
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    // Find the job by ID (only public and active jobs)
    const job = await Job.findOne({
      _id: id,
      visibility: 'public',
      status: 'active'
    })
    .populate('createdBy', 'firstName lastName')
    .lean();
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Increment view count (optional - you might want to track this)
    await Job.findByIdAndUpdate(id, { 
      $inc: { viewCount: 1 } 
    });
    
    return NextResponse.json({ job });
    
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}
