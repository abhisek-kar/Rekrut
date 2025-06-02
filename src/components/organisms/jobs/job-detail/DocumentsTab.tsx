'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import {
  FileText,
  Upload,
  Download,
  MoreHorizontal,
  Eye,
  Trash,
  File,
  FileImage,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileQuestion,
} from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';

// Document type definition (to be moved to types)
interface JobDocument {
  _id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  uploadDate: string;
}

interface DocumentsTabProps {
  jobId: string;
}

export function DocumentsTab({ jobId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<JobDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentToPreview, setDocumentToPreview] = useState<JobDocument | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<JobDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch documents when component mounts
  useEffect(() => {
    fetchDocuments();
  }, [jobId]);
  
  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/jobs/${jobId}/documents`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Start upload process
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.split('.')[0]);
      formData.append('category', selectedTab !== 'all' ? selectedTab : 'other');
      
      // Track upload progress
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      // Upload file
      const uploadPromise = new Promise<Document>((resolve, reject) => {
        xhr.open('POST', `/api/jobs/${jobId}/documents`);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.document);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
      
      const uploadedDocument = await uploadPromise;
      
      // Add the new document to the list
      setDocuments(prev => [uploadedDocument, ...prev]);
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle document preview
  const handlePreviewDocument = (doc: JobDocument) => {
    setDocumentToPreview(doc);
    setShowPreviewDialog(true);
  };
  
  // Handle document download
  const handleDownloadDocument = (doc: JobDocument) => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success(`Downloading ${doc.fileName}`);
  };
  
  // Handle document delete confirmation
  const handleDeleteConfirmation = (doc: JobDocument) => {
    setDocumentToDelete(doc);
    setShowDeleteDialog(true);
  };
  
  // Handle document delete
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/documents/${documentToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      setDocuments(prev => prev.filter(doc => doc._id !== documentToDelete._id));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get icon for document based on mime type
  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else if (mimeType.includes('image')) {
      return <FileImage className="h-6 w-6 text-purple-500" />;
    } else if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) {
      return <FileCode className="h-6 w-6 text-yellow-500" />;
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return <FileArchive className="h-6 w-6 text-gray-500" />;
    } else {
      return <FileQuestion className="h-6 w-6 text-gray-400" />;
    }
  };
  
  // Filter documents based on selected tab
  const filteredDocuments = selectedTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedTab);
  
  // Render loading state
  const renderLoading = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-3 rounded-md border mb-3">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ));
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Job-related documents and files</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="compensation">Compensation</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="mt-0">
            {isUploading && (
              <div className="mb-4 border rounded-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <File className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Uploading document...</p>
                    <div className="h-1.5 w-full bg-secondary rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
              </div>
            )}
            
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                renderLoading()
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">No documents found</h3>
                  <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                    {selectedTab === 'all' 
                      ? "No documents have been uploaded for this job yet."
                      : `No documents in the ${selectedTab} category.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((document) => (
                    <div 
                      key={document._id} 
                      className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      {getDocumentIcon(document.mimeType)}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{document.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>•</span>
                          <span>Uploaded {format(new Date(document.uploadDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewDocument(document)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadDocument(document)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteConfirmation(document)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Document Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{documentToPreview?.name}</DialogTitle>
            <DialogDescription>
              {documentToPreview?.fileName} • {documentToPreview && formatFileSize(documentToPreview.fileSize)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center p-4 h-96 bg-muted rounded-md">
            {documentToPreview && (
              <div className="flex flex-col items-center justify-center gap-4">
                {getDocumentIcon(documentToPreview.mimeType)}
                <p className="text-sm text-muted-foreground">
                  Preview not available. Click below to download the file.
                </p>
                <Button onClick={() => handleDownloadDocument(documentToPreview)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the document &quot;{documentToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
