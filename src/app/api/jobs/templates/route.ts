import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import Job from '@/models/Job';
import Activity from '@/models/Activity';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Build query for templates
    const query: any = {
      isTemplate: true,
    };
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const totalTemplates = await Job.countDocuments(query);
    
    // Get templates with pagination
    const templates = await Job.find(query)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');
    
    return NextResponse.json({
      templates,
      pagination: {
        total: totalTemplates,
        page,
        limit,
        pages: Math.ceil(totalTemplates / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching job templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job templates' },
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
    
    // Parse template data from request
    const data = await request.json();
    
    // Make sure to mark as template
    data.isTemplate = true;
    
    // Add the current user as creator
    data.createdBy = session.user.id;
    
    // Create new template
    const template = await Job.create(data);
    
    // Log the activity
    await Activity.create({
      userId: session.user.id,
      action: 'create',
      entityType: 'job_template',
      entityId: template._id,
      details: { templateTitle: template.title },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
    
    return NextResponse.json(
      { template, message: 'Job template created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job template:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create job template' },
      { status: 500 }
    );
  }
}
