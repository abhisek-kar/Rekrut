import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import Application from '@/models/Application';
import { sendApplicationConfirmation, notifyNewJobApplication } from '@/lib/email/notifications';
import Candidate from '@/models/Candidate';
import Job from '@/models/Job';
import { randomBytes } from 'crypto';

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
      job?: mongoose.Types.ObjectId; 
      candidate?: mongoose.Types.ObjectId | { $in: mongoose.Types.ObjectId[] }; 
      status?: string;
    } = {};
    
    // Job filter
    if (jobId) {
      query.job = new mongoose.Types.ObjectId(jobId);
    }
    
    // Candidate filter
    if (candidateId) {
      query.candidate = new mongoose.Types.ObjectId(candidateId);
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
        query.candidate = { $in: candidates.map(c => c._id) };
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
      .populate('candidate', 'firstName lastName email profilePhoto')
      .populate('job', 'title company')
      .lean();
      
    // Transform to expected format
    applications = applications.map(app => ({
      _id: app._id.toString(),
      applicationDate: app.createdAt 
      status: app.status,
      source: app.source,
      matchingScore: app.matchScore,
      job: {
        _id: (app.job as any)._id.toString(),
        title: (app.job as any).title,
        company: (app.job as any).company
      },
      candidate: {
        _id: (app.candidate as any)._id.toString(),
        firstName: (app.candidate as any).firstName,
        lastName: (app.candidate as any).lastName,
        email: (app.candidate as any).email,
        profilePhoto: (app.candidate as any).profilePhoto
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

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const applicationDataStr = formData.get('applicationData') as string;
    
    if (!jobId || !applicationDataStr) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const applicationData = JSON.parse(applicationDataStr);
    
    // Validate required fields
    if (!applicationData.firstName || !applicationData.lastName || !applicationData.email) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      );
    }
    
    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Create or find candidate
    let candidate = await Candidate.findOne({ email: applicationData.email });
    
    if (!candidate) {
      // Create new candidate
      candidate = new Candidate({
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        linkedinProfile: applicationData.linkedinProfile,
        portfolioWebsite: applicationData.portfolioWebsite,
        currentJobTitle: applicationData.currentRole,
        currentCompany: applicationData.currentCompany,
        expectedSalary: applicationData.expectedSalary,
        noticePeriod: applicationData.noticePeriod,
        skills: applicationData.skills?.map((skill: string) => ({ name: skill })) || [],
        currentAddress: {
          city: applicationData.location
        },
        preferences: {
          workLocation: applicationData.preferredWorkType,
          willingToRelocate: applicationData.willingToRelocate,
          availableStartDate: applicationData.availableStartDate
        },
        source: 'website',
        notes: applicationData.additionalMessage
      });
      
      await candidate.save();
    } else {
      // Update existing candidate with new information
      candidate.phone = applicationData.phone || candidate.phone;
      candidate.linkedinProfile = applicationData.linkedinProfile || candidate.linkedinProfile;
      candidate.portfolioWebsite = applicationData.portfolioWebsite || candidate.portfolioWebsite;
      candidate.currentJobTitle = applicationData.currentRole || candidate.currentJobTitle;
      candidate.currentCompany = applicationData.currentCompany || candidate.currentCompany;
      candidate.expectedSalary = applicationData.expectedSalary || candidate.expectedSalary;
      candidate.noticePeriod = applicationData.noticePeriod || candidate.noticePeriod;
      
      // Merge skills
      if (applicationData.skills?.length > 0) {
        const existingSkills = candidate.skills?.map(s => s.name) || [];
        const newSkills = applicationData.skills.filter((skill: string) => !existingSkills.includes(skill));
        candidate.skills = [
          ...(candidate.skills || []),
          ...newSkills.map((skill: string) => ({ name: skill }))
        ];
      }
      
      if (applicationData.location && !candidate.currentAddress?.city) {
        candidate.currentAddress = {
          ...candidate.currentAddress,
          city: applicationData.location
        };
      }
      
      await candidate.save();
    }
    
    // Check if application already exists
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: candidate._id
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 409 }
      );
    }
    
    // Handle file uploads (for simplicity, we'll store file info without actual upload)
    const documents: any = {};
    
    // Get resume file
    const resumeFile = formData.get('resume') as File;
    if (resumeFile) {
      documents.resume = {
        filename: resumeFile.name,
        url: `/uploads/resumes/${candidate._id}_${Date.now()}_${resumeFile.name}`, // Placeholder URL
      };
    }
    
    // Get cover letter file
    const coverLetterFile = formData.get('coverLetter') as File;
    if (coverLetterFile) {
      documents.coverLetter = {
        filename: coverLetterFile.name,
        url: `/uploads/cover-letters/${candidate._id}_${Date.now()}_${coverLetterFile.name}`, // Placeholder URL
      };
    }
    
    // Get portfolio files
    const additionalDocuments: any[] = [];
    let fileIndex = 0;
    while (formData.get(`portfolioFile_${fileIndex}`)) {
      const file = formData.get(`portfolioFile_${fileIndex}`) as File;
      additionalDocuments.push({
        filename: file.name,
        url: `/uploads/portfolio/${candidate._id}_${Date.now()}_${file.name}`, // Placeholder URL
        documentType: 'portfolio'
      });
      fileIndex++;
    }
    
    // Create application
    const application = new Application({
      job: jobId,
      candidate: candidate._id,
      status: 'applied',
      statusHistory: [{
        status: 'applied',
        date: new Date(),
        reason: 'Application submitted via website'
      }],
      resume: documents.resume,
      coverLetter: documents.coverLetter,
      additionalDocuments: additionalDocuments.length > 0 ? additionalDocuments : undefined,
      source: 'website',
      answers: {
        experienceLevel: applicationData.experienceLevel,
        additionalMessage: applicationData.additionalMessage,
        availableStartDate: applicationData.availableStartDate,
        willingToRelocate: applicationData.willingToRelocate,
        preferredWorkType: applicationData.preferredWorkType
      }
    });
    
    await application.save();
    
    // Generate a tracking token for the application
    const trackingToken = randomBytes(32).toString('hex');
    
    // Send application confirmation email to candidate
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    try {
      await sendApplicationConfirmation(
        application._id.toString(),
        trackingToken,
        appUrl
      );
    } catch (emailError) {
      console.error('Failed to send application confirmation:', emailError);
      // Don't fail the application if email fails
    }
    
    // Notify recruiters about new application
    try {
      await notifyNewJobApplication(
        application._id.toString(),
        appUrl
      );
    } catch (notificationError) {
      console.error('Failed to send application notification:', notificationError);
      // Don't fail the application if notification fails
    }
    
    // TODO: In a real implementation, you would:
    // 1. Upload files to AWS S3 or similar storage
    // 2. Send confirmation email to candidate
    // 3. Send notification to hiring team
    // 4. Store tracking token in database for application status tracking
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application._id,
      token: trackingToken
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating application:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Invalid application data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
