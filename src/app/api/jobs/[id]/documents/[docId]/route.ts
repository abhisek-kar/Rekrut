import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { authOptions } from '@/lib/auth/nextauth';
import { deleteFile } from '@/lib/aws/s3';
import Job from '@/models/Job';
import Activity from '@/models/Activity';

// Get Document model
const Document = mongoose.models.Document;

// DELETE: Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, docId: string } }
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
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(params.id) || !mongoose.Types.ObjectId.isValid(params.docId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    // Check if job exists
    const job = await Job.findById(params.id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Fetch document
    const document = await Document.findById(params.docId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if document belongs to the job
    if (document.jobId.toString() !== params.id) {
      return NextResponse.json(
        { error: 'Document does not belong to this job' },
        { status: 403 }
      );
    }
    
    // Delete file from S3
    await deleteFile(document.fileKey);
    
    // Delete document from database
    await Document.findByIdAndDelete(params.docId);
    
    // Log activity
    await Activity.create({
      userId: session.user.id,
      action: 'delete_document',
      entityType: 'job',
      entityId: params.id,
      details: {
        jobTitle: job.title,
        documentName: document.name,
        fileName: document.fileName
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
