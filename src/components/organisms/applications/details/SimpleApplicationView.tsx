import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { Separator } from "@/components/shadcn-ui/separator";
import { SectionLoader } from "@/components/atoms/loader";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  Plus,
  Edit,
  Briefcase,
  Home,
} from "lucide-react";
import { format } from "date-fns";
import { InterviewDialog, NoteDialog, ReviewDialog } from "./EditDialogs";
import { toast } from "sonner";

interface ApplicationDetailsProps {
  application: any;
  loading: boolean;
  userRole: "admin" | "subadmin";
  onRefresh?: () => void;
}

export const SimpleApplicationView: React.FC<ApplicationDetailsProps> = ({
  application,
  loading,
  userRole,
  onRefresh = () => {},
}) => {
  // Dialog states
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSuccess = () => {
    onRefresh();
  };

  const deleteInterview = async (interviewId: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/applications/${application._id}/interviews/${interviewId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete interview");
      toast.success("Interview deleted successfully");
      handleSuccess();
    } catch (error) {
      toast.error("Failed to delete interview");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/applications/${application._id}/notes/${noteId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete note");
      toast.success("Note deleted successfully");
      handleSuccess();
    } catch (error) {
      toast.error("Failed to delete note");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/applications/${application._id}/review`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete review");
      toast.success("Review deleted successfully");
      handleSuccess();
    } catch (error) {
      toast.error("Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <SectionLoader message="Loading application details..." height="400px" />;
  }

  if (!application) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Application not found.
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    } else if (currency === 'EUR') {
      return `€${amount.toLocaleString()}`;
    } else if (currency === 'GBP') {
      return `£${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Candidate Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={application.candidate?.profilePhoto} />
                <AvatarFallback className="text-lg">
                  {application.candidate?.firstName?.[0]}
                  {application.candidate?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold mb-1">
                  {application.candidate?.firstName} {application.candidate?.lastName}
                </h1>
                <p className="text-muted-foreground mb-2">{application.candidate?.email}</p>
                
                {application.candidate?.currentJobTitle && (
                  <p className="text-sm font-medium text-primary mb-2">
                    {application.candidate.currentJobTitle}
                    {application.candidate.currentCompany && (
                      <span className="text-muted-foreground"> at {application.candidate.currentCompany}</span>
                    )}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="default">
                    {application.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  
                  {application.candidate?.experienceLevel && (
                    <Badge variant="secondary">
                      {application.candidate.experienceLevel.replace('_', ' ').toUpperCase()}
                    </Badge>
                  )}
                  
                  {application.matchScore && (
                    <Badge variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      {application.matchScore}% Match
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Application Summary */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Position</span>
                  </div>
                  <p className="font-semibold">{application.job?.title || "Not specified"}</p>
                  <p className="text-sm text-muted-foreground">{application.job?.company}</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Applied</span>
                  </div>
                  <p className="font-semibold">
                    {application.createdAt ? format(new Date(application.createdAt), "MMM d, yyyy") : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">{application.source || "Direct"}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => setShowInterviewDialog(true)} 
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  
                  <Button 
                    onClick={() => setShowNoteDialog(true)} 
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                  
                  <Button 
                    onClick={() => setShowReviewDialog(true)} 
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Add Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{application.candidate?.email}</p>
                  </div>
                </div>
                
                {application.candidate?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{application.candidate.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {application.candidate?.currentAddress && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Current Address</p>
                      <p className="mt-1">
                        {[
                          application.candidate.currentAddress.street,
                          application.candidate.currentAddress.city,
                          application.candidate.currentAddress.state,
                          application.candidate.currentAddress.postalCode,
                          application.candidate.currentAddress.country,
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {application.candidate?.permanentAddress && !application.candidate?.isSameAsPermanent && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Permanent Address</p>
                      <p className="mt-1">
                        {[
                          application.candidate.permanentAddress.street,
                          application.candidate.permanentAddress.city,
                          application.candidate.permanentAddress.state,
                          application.candidate.permanentAddress.postalCode,
                          application.candidate.permanentAddress.country,
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.candidate?.currentSalary && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Current CTC</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(application.candidate.currentSalary, application.candidate.currentSalaryCurrency)}
                    </p>
                  </div>
                )}

                {application.candidate?.expectedSalary && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Expected CTC</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(application.candidate.expectedSalary, application.candidate.expectedSalaryCurrency)}
                    </p>
                  </div>
                )}

                {application.candidate?.yearsOfExperience && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-semibold">{application.candidate.yearsOfExperience} years</p>
                  </div>
                )}

                {application.candidate?.noticePeriod && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Notice Period</p>
                    <p className="font-semibold">{application.candidate.noticePeriod}</p>
                  </div>
                )}

                {application.candidate?.preferredWorkArrangement && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Work Preference</p>
                    <p className="font-semibold capitalize">{application.candidate.preferredWorkArrangement}</p>
                  </div>
                )}

                {application.candidate?.willingToRelocate !== undefined && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Willing to Relocate</p>
                    <Badge variant={application.candidate.willingToRelocate ? "default" : "secondary"}>
                      {application.candidate.willingToRelocate ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {application.candidate?.skills && application.candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {application.candidate.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Comments */}
          {application.candidate?.additionalComments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Additional Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p>{application.candidate.additionalComments}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                File Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.resume && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Resume</p>
                      <p className="text-xs text-muted-foreground">{application.resume.filename}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={application.resume.url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}

              {application.coverLetter && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Cover Letter</p>
                      <p className="text-xs text-muted-foreground">{application.coverLetter.filename}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={application.coverLetter.url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}

              {!application.resume && !application.coverLetter && (
                <p className="text-sm text-muted-foreground text-center py-4">No files uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          {application.statusHistory && application.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.statusHistory.map((status: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">
                          {status.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(status.date), "MMM d, yyyy")}
                        </p>
                        {status.reason && (
                          <p className="text-xs text-muted-foreground">{status.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <InterviewDialog
        open={showInterviewDialog}
        onClose={() => setShowInterviewDialog(false)}
        applicationId={application._id}
        interview={editingItem}
        onSuccess={handleSuccess}
      />

      <NoteDialog
        open={showNoteDialog}
        onClose={() => setShowNoteDialog(false)}
        applicationId={application._id}
        note={editingItem}
        onSuccess={handleSuccess}
      />

      <ReviewDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        applicationId={application._id}
        review={application.review}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
