import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Label } from '@/components/shadcn-ui/label';
import { Badge } from '@/components/shadcn-ui/badge';
import { ApplicationData } from '../MultiStepApplicationForm';
import { ChevronRight, ChevronLeft, Upload, FileText, X, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadStepProps {
  data: ApplicationData;
  updateData: (updates: Partial<ApplicationData>) => void;
  job?: {
    _id: string;
    title: string;
    company: string;
    requiredDocuments?: string[];
  };
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ 
  data, 
  updateData,
  job 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Get dynamic file type restrictions based on job requirements
  const getFileAcceptTypes = (documentType: string): string => {
    const baseTypes: Record<string, string> = {
      'Resume/CV': '.pdf,.doc,.docx',
      'resume': '.pdf,.doc,.docx',
      'Cover Letter': '.pdf,.doc,.docx',
      'coverLetter': '.pdf,.doc,.docx',
      'Portfolio': '.pdf,.zip,.jpg,.jpeg,.png',
      'portfolio': '.pdf,.zip,.jpg,.jpeg,.png',
      'Work Samples': '.pdf,.doc,.docx,.zip,.jpg,.jpeg,.png',
      'Certifications': '.pdf,.jpg,.jpeg,.png',
      'References': '.pdf,.doc,.docx',
      'Transcripts': '.pdf,.jpg,.jpeg,.png',
      'License': '.pdf,.jpg,.jpeg,.png'
    };
    
    // Default to document types if not found
    return baseTypes[documentType] || '.pdf,.doc,.docx';
  };

  const getAllowedMimeTypes = (documentType: string): string[] => {
    const baseTypes: Record<string, string[]> = {
      'Resume/CV': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'Cover Letter': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'coverLetter': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'Portfolio': ['application/pdf', 'application/zip', 'image/jpeg', 'image/png'],
      'portfolio': ['application/pdf', 'application/zip', 'image/jpeg', 'image/png'],
      'Work Samples': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'image/jpeg', 'image/png'],
      'Certifications': ['application/pdf', 'image/jpeg', 'image/png'],
      'References': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'Transcripts': ['application/pdf', 'image/jpeg', 'image/png'],
      'License': ['application/pdf', 'image/jpeg', 'image/png']
    };
    
    // Default to document types if not found
    return baseTypes[documentType] || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  };

  // Check if a document type is required based on job requirements
  const isDocumentRequired = (documentType: string) => {
    if (!job?.requiredDocuments) return documentType === 'resume'; // Resume always required
    
    // Check for exact matches or common variations
    const requiredDocs = job.requiredDocuments.map(doc => doc.toLowerCase());
    const docType = documentType.toLowerCase();
    
    return requiredDocs.some(reqDoc => 
      reqDoc.includes(docType) || 
      docType.includes(reqDoc) ||
      (docType === 'resume' && (reqDoc.includes('cv') || reqDoc.includes('resume'))) ||
      (docType === 'coverletter' && reqDoc.includes('cover'))
    );
  };

  const handleFileUpload = async (file: File, type: 'resume' | 'coverLetter' | 'portfolio') => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    // Get allowed types based on document type and job requirements
    const allowedTypes = getAllowedMimeTypes(type);

    if (!allowedTypes.includes(file.type)) {
      const docTypeDisplay = type === 'resume' ? 'Resume/CV' : 
                            type === 'coverLetter' ? 'Cover Letter' : 'Portfolio';
      const supportedFormats = getFileAcceptTypes(type).split(',').map(ext => ext.replace('.', '').toUpperCase()).join(', ');
      alert(`Invalid file type for ${docTypeDisplay}. Please upload a file in one of these formats: ${supportedFormats}`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // In a real implementation, you would upload to your API
      // For now, we'll simulate the upload and store the file directly
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Store the file directly in ApplicationData
      const updates: Partial<ApplicationData> = {};
      if (type === 'resume') {
        updates.resume = file;
      } else if (type === 'coverLetter') {
        updates.coverLetter = file;
      } else if (type === 'portfolio') {
        updates.portfolioFiles = [...(data.portfolioFiles || []), file];
      }

      updateData(updates);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = (type: 'resume' | 'coverLetter' | 'portfolio') => {
    const updates: Partial<ApplicationData> = {};
    if (type === 'resume') {
      updates.resume = undefined;
    } else if (type === 'coverLetter') {
      updates.coverLetter = undefined;
    } else if (type === 'portfolio') {
      updates.portfolioFiles = [];
    }
    updateData(updates);
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'coverLetter' | 'portfolio') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileUploadArea = ({ 
    type, 
    label, 
    description, 
    required = false, 
    file, 
    inputRef 
  }: {
    type: 'resume' | 'coverLetter' | 'portfolio';
    label: string;
    description: string;
    required?: boolean;
    file?: File;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => {
    const getSupportedFormats = () => {
      const acceptTypes = getFileAcceptTypes(type);
      return acceptTypes.split(',').map(ext => ext.replace('.', '').toUpperCase()).join(', ');
    };

    return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {label} 
        {required && <span className="text-destructive">*</span>}
        {file && <CheckCircle className="h-4 w-4 text-primary" />}
      </Label>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver === type 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, type)}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            Drag & drop your {label.toLowerCase()} or{' '}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => inputRef.current?.click()}
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Formats: {getSupportedFormats()}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/50 border-muted-foreground/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Create a temporary URL for preview
                  const url = URL.createObjectURL(file);
                  window.open(url, '_blank');
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFileRemove(type)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={getFileAcceptTypes(type)}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, type);
        }}
      />
    </div>
  );
};

  // Dynamic validation based on job requirements
  const getRequiredDocuments = () => {
    if (!job?.requiredDocuments) return ['resume']; // Resume always required by default
    
    const required = [];
    const requiredDocs = job.requiredDocuments.map(doc => doc.toLowerCase());
    
    // Always require resume if any CV/Resume document is mentioned
    if (requiredDocs.some(doc => doc.includes('resume') || doc.includes('cv'))) {
      required.push('resume');
    } else if (requiredDocs.length === 0) {
      required.push('resume'); // Default fallback
    }
    
    // Check for cover letter requirement
    if (requiredDocs.some(doc => doc.includes('cover'))) {
      required.push('coverLetter');
    }
    
    // Check for portfolio requirement
    if (requiredDocs.some(doc => doc.includes('portfolio') || doc.includes('work samples'))) {
      required.push('portfolio');
    }
    
    return required;
  };

  // Get the required documents list
  const requiredDocs = getRequiredDocuments();

  // Get missing required documents for better error messaging
  const getMissingDocuments = () => {
    const missing = [];
    if (requiredDocs.includes('resume') && !data.resume) {
      missing.push('Resume/CV');
    }
    if (requiredDocs.includes('coverLetter') && !data.coverLetter) {
      missing.push('Cover Letter');
    }
    if (requiredDocs.includes('portfolio') && !data.portfolioFiles?.[0]) {
      missing.push('Portfolio/Work Samples');
    }
    return missing;
  };

  // Validation state
  const missingDocs = getMissingDocuments();
  const isValid = missingDocs.length === 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload your resume and any additional documents to support your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Job-specific document requirements */}
            {job?.requiredDocuments && job.requiredDocuments.length > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Required Documents for this Position
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General information */}
            <div className="p-4 bg-muted/50 border border-muted-foreground/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Maximum file size: 10MB per file. Supported formats vary by document type.
                {!job?.requiredDocuments?.length && (
                  <span className="block mt-1">
                    <strong>Resume/CV is always required.</strong> Other documents are optional unless specified.
                  </span>
                )}
              </p>
            </div>

            <FileUploadArea
              type="resume"
              label="Resume/CV"
              description={`Supported formats: PDF, DOC, DOCX (max 10MB)`}
              required={isDocumentRequired('resume')}
              file={data.resume}
              inputRef={resumeInputRef}
            />

            <FileUploadArea
              type="coverLetter"
              label="Cover Letter"
              description={`${isDocumentRequired('coverLetter') ? 'Required' : 'Optional'} - Supported formats: PDF, DOC, DOCX (max 10MB)`}
              required={isDocumentRequired('coverLetter')}
              file={data.coverLetter}
              inputRef={coverLetterInputRef}
            />

            <FileUploadArea
              type="portfolio"
              label="Portfolio/Work Samples"
              description={`${isDocumentRequired('portfolio') ? 'Required' : 'Optional'} - Supported formats: PDF, ZIP, JPG, PNG (max 10MB)`}
              required={isDocumentRequired('portfolio')}
              file={data.portfolioFiles?.[0]}
              inputRef={portfolioInputRef}
            />

            {uploading && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-foreground">Uploading file...</p>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUploadStep;
