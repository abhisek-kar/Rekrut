import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Label } from "@/components/shadcn-ui/label";
import { Badge } from "@/components/shadcn-ui/badge";
import { ApplicationData } from "../MultiStepApplicationForm";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  X,
  Download,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
  job,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Get dynamic file type restrictions based on document type
  const getFileAcceptTypes = (documentType: string): string => {
    const normalizedType = documentType.toLowerCase();

    // Map document types to file extensions
    if (normalizedType.includes("resume") || normalizedType.includes("cv")) {
      return ".pdf,.doc,.docx";
    } else if (
      normalizedType.includes("cover") ||
      normalizedType.includes("letter")
    ) {
      return ".pdf,.doc,.docx";
    } else if (
      normalizedType.includes("portfolio") ||
      normalizedType.includes("sample")
    ) {
      return ".pdf,.zip,.jpg,.jpeg,.png";
    } else if (
      normalizedType.includes("certificate") ||
      normalizedType.includes("license")
    ) {
      return ".pdf,.jpg,.jpeg,.png";
    } else if (normalizedType.includes("transcript")) {
      return ".pdf,.jpg,.jpeg,.png";
    } else {
      // Default to common document formats
      return ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    }
  };

  const getAllowedMimeTypes = (documentType: string): string[] => {
    const normalizedType = documentType.toLowerCase();

    if (
      normalizedType.includes("resume") ||
      normalizedType.includes("cv") ||
      normalizedType.includes("cover") ||
      normalizedType.includes("letter")
    ) {
      return [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
    } else if (
      normalizedType.includes("portfolio") ||
      normalizedType.includes("sample")
    ) {
      return ["application/pdf", "application/zip", "image/jpeg", "image/png"];
    } else {
      return [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
    }
  };

  const validateFile = (file: File, documentType: string): string | null => {
    const allowedTypes = getAllowedMimeTypes(documentType);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${getFileAcceptTypes(
        documentType
      )}`;
    }

    if (file.size > maxSize) {
      return "File size must be less than 10MB.";
    }

    return null;
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    const validationError = validateFile(file, documentType);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Update the documents object
      const currentDocuments = data.documents || {};
      const updatedDocuments = {
        ...currentDocuments,
        [documentType]: file,
      };

      updateData({ documents: updatedDocuments });

      setUploadProgress(100);
      clearInterval(interval);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = (documentType: string) => {
    const currentDocuments = data.documents || {};
    const { [documentType]: removed, ...remainingDocuments } = currentDocuments;
    updateData({ documents: remainingDocuments });
  };

  const handleDragOver = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], documentType);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get the list of documents to show (either from job requirements or default)
  const getDocumentsToShow = (): string[] => {
    if (job?.requiredDocuments && job.requiredDocuments.length > 0) {
      return job.requiredDocuments;
    }
    // Default documents if no specific requirements
    return ["Resume/CV"];
  };

  const documentsToShow = getDocumentsToShow();

  const FileUploadArea = ({
    documentType,
    required = true,
  }: {
    documentType: string;
    required?: boolean;
  }) => {
    const file = data.documents?.[documentType];
    const inputRef = useRef<HTMLInputElement>(null);

    const getSupportedFormats = () => {
      const acceptTypes = getFileAcceptTypes(documentType);
      return acceptTypes
        .split(",")
        .map((ext) => ext.replace(".", "").toUpperCase())
        .join(", ");
    };

    const getFileDescription = () => {
      const formats = getSupportedFormats();
      return `Supported formats: ${formats} (max 10MB)`;
    };

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {documentType}
          {required && <span className="text-destructive">*</span>}
          {file && <CheckCircle className="h-4 w-4 text-primary" />}
        </Label>

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver === documentType
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => handleDragOver(e, documentType)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, documentType)}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              Drop your {documentType.toLowerCase()} here, or{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              {getFileDescription()}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Uploaded</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileRemove(documentType)}
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
          accept={getFileAcceptTypes(documentType)}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file, documentType);
            }
          }}
          className="hidden"
        />
      </div>
    );
  };

  // Check if all required documents are uploaded
  const getMissingDocuments = () => {
    return documentsToShow.filter((docType) => !data.documents?.[docType]);
  };

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
            {job?.requiredDocuments && job.requiredDocuments.length > 0
              ? `Upload the required documents for the ${job.title} position.`
              : "Upload your documents to support your application."}
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
                      <div
                        className={`w-2 h-2 rounded-full ${
                          data.documents?.[doc] ? "bg-green-500" : "bg-primary"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          data.documents?.[doc]
                            ? "text-green-700 line-through"
                            : "text-foreground"
                        }`}
                      >
                        {doc}
                      </span>
                      {data.documents?.[doc] && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="p-4 bg-muted/50 border border-muted-foreground/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Uploading...</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* File upload areas for each required document */}
            {documentsToShow.map((documentType) => (
              <FileUploadArea
                key={documentType}
                documentType={documentType}
                required={true}
              />
            ))}

            {/* Validation message */}
            {missingDocs.length > 0 && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Missing Required Documents
                    </p>
                    <p className="text-sm text-destructive/80 mt-1">
                      Please upload: {missingDocs.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success message */}
            {isValid && documentsToShow.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    All required documents have been uploaded successfully!
                  </p>
                </div>
              </div>
            )}

            {/* General information */}
            <div className="p-4 bg-muted/50 border border-muted-foreground/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Maximum file size: 10MB per file. Supported formats vary by
                document type. All uploaded files are securely stored and will
                only be accessible to the hiring team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUploadStep;
