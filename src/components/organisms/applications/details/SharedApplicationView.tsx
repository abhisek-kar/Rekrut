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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { Separator } from "@/components/shadcn-ui/separator";
import { SectionLoader } from "@/components/atoms/loader";
import {
  Calendar,
  MapPin,
  Video,
  Phone,
  Users,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Download,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { InterviewDialog, NoteDialog, ReviewDialog } from "./EditDialogs";
import { toast } from "sonner";

// Utility function to format timezone display
const getTimezoneDisplay = (timezone?: string) => {
  if (!timezone) return null;

  const timezoneLabels: { [key: string]: string } = {
    "America/New_York": "ET",
    "America/Chicago": "CT",
    "America/Denver": "MT",
    "America/Los_Angeles": "PT",
    UTC: "UTC",
    "Europe/London": "GMT",
    "Europe/Paris": "CET",
    "Asia/Tokyo": "JST",
    "Asia/Shanghai": "CST",
    "Asia/Kolkata": "IST",
    "Australia/Sydney": "AEST",
  };

  return timezoneLabels[timezone] || timezone;
};

interface ApplicationDetailsProps {
  application: any;
  loading: boolean;
  userRole: "admin" | "subadmin";
  onRefresh?: () => void;
}

export const SharedApplicationView: React.FC<ApplicationDetailsProps> = ({
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

  // Handle refresh after successful operations
  const handleSuccess = () => {
    onRefresh();
  };

  // Delete functions
  const deleteInterview = async (interviewId: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/applications/${application._id}/interviews/${interviewId}`,
        {
          method: "DELETE",
        }
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
        {
          method: "DELETE",
        }
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
        {
          method: "DELETE",
        }
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

  if (loading)
    return (
      <SectionLoader message="Loading application details..." height="400px" />
    );
  if (!application)
    return (
      <div className="text-center py-12 text-muted-foreground">
        Application not found.
      </div>
    );

  const getStatusColor = (status: string) => {
    const statusColors = {
      applied: "border",
      screening: "border",
      interview_scheduled: "border",
      interviewed: "border",
      offered: "border",
      hired: "border",
      rejected: "border",
    };
    return statusColors[status as keyof typeof statusColors] || "border";
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "phone":
        return Phone;
      case "onsite":
        return MapPin;
      default:
        return Calendar;
    }
  };

  const getInterviewStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      case "no_show":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Candidate and Application Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Candidate Info */}
            <div className="flex flex-col items-center lg:items-start gap-4 lg:w-1/3">
              <Avatar className="w-24 h-24">
                <AvatarImage src={application.candidate?.profilePhoto} />
                <AvatarFallback className="text-lg">
                  {application.candidate?.firstName?.[0]}
                  {application.candidate?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center lg:text-left">
                <h1 className="font-bold text-2xl mb-1">
                  {application.candidate?.firstName || "Unknown"}{" "}
                  {application.candidate?.lastName || "Candidate"}
                </h1>
                <p className="text-muted-foreground mb-2">
                  {application.candidate?.email || "No email provided"}
                </p>
                {application.candidate?.currentJobTitle && (
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    {application.candidate.currentJobTitle}
                    {application.candidate.currentCompany && (
                      <span className="text-muted-foreground">
                        {" "}
                        at {application.candidate.currentCompany}
                      </span>
                    )}
                  </p>
                )}
                {application.candidate?.yearsOfExperience && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {application.candidate.yearsOfExperience} years of
                    experience
                  </p>
                )}
                {application.candidate?.phone && (
                  <p className="text-muted-foreground text-sm">
                    {application.candidate.phone}
                  </p>
                )}
                {application.candidate?.location && (
                  <p className="text-muted-foreground text-sm flex items-center justify-center lg:justify-start mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {application.candidate.location}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start">
                  {application.candidate?.linkedinProfile && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={application.candidate.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {application.candidate?.portfolioWebsite && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={application.candidate.portfolioWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
                <Badge className={`mt-3 ${getStatusColor(application.status)}`}>
                  {application.status
                    ? application.status.replace("_", " ").toUpperCase()
                    : "UNKNOWN"}
                </Badge>
              </div>
            </div>

            {/* Application Info */}
            <div className="flex-1 space-y-6">
              {/* Job & Application Overview */}
              <div>
                <h2 className="font-semibold text-lg mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Application Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground font-medium">
                      Job Position
                    </div>
                    <div className="font-semibold text-lg">
                      {application.job?.title || "Position not specified"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.job?.company || "Company not specified"}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground font-medium">
                      Applied
                    </div>
                    <div className="font-semibold">
                      {application.createdAt
                        ? format(new Date(application.createdAt), "PPP")
                        : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.source
                        ? `via ${application.source}`
                        : "Direct application"}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground font-medium">
                      Match Score
                    </div>
                    <div className="font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {application.matchScore || "N/A"}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      AI Assessment
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-md mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Full Name</div>
                    <div className="font-medium">
                      {application.candidate?.firstName || "Unknown"}{" "}
                      {application.candidate?.lastName || "Candidate"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">
                      {application.candidate?.email || "No email provided"}
                    </div>
                  </div>
                  {application.candidate?.phone && (
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-medium">
                        {application.candidate.phone}
                      </div>
                    </div>
                  )}
                  {application.candidate?.dateOfBirth && (
                    <div>
                      <div className="text-muted-foreground">Date of Birth</div>
                      <div className="font-medium">
                        {format(
                          new Date(application.candidate.dateOfBirth),
                          "PPP"
                        )}
                      </div>
                    </div>
                  )}
                  {application.candidate?.currentAddress && (
                    <div className="md:col-span-2">
                      <div className="text-muted-foreground">
                        Current Address
                      </div>
                      <div className="font-medium">
                        {[
                          application.candidate.currentAddress.street,
                          application.candidate.currentAddress.city,
                          application.candidate.currentAddress.state,
                          application.candidate.currentAddress.postalCode,
                          application.candidate.currentAddress.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Not provided"}
                      </div>
                    </div>
                  )}
                  {application.candidate?.willingToRelocate !== undefined && (
                    <div>
                      <div className="text-muted-foreground">
                        Willing to Relocate
                      </div>
                      <div className="font-medium">
                        <Badge
                          variant={
                            application.candidate.willingToRelocate
                              ? "default"
                              : "secondary"
                          }
                        >
                          {application.candidate.willingToRelocate
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="font-semibold text-md mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Professional Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {application.candidate?.currentJobTitle && (
                    <div>
                      <div className="text-muted-foreground">
                        Current Position
                      </div>
                      <div className="font-medium">
                        {application.candidate.currentJobTitle}
                      </div>
                    </div>
                  )}
                  {application.candidate?.currentCompany && (
                    <div>
                      <div className="text-muted-foreground">
                        Current Company
                      </div>
                      <div className="font-medium">
                        {application.candidate.currentCompany}
                      </div>
                    </div>
                  )}
                  {application.candidate?.employmentStatus && (
                    <div>
                      <div className="text-muted-foreground">
                        Employment Status
                      </div>
                      <div className="font-medium capitalize">
                        {application.candidate.employmentStatus}
                      </div>
                    </div>
                  )}
                  {application.candidate?.yearsOfExperience && (
                    <div>
                      <div className="text-muted-foreground">
                        Years of Experience
                      </div>
                      <div className="font-medium">
                        {application.candidate.yearsOfExperience} years
                      </div>
                    </div>
                  )}
                  {application.candidate?.currentSalary && (
                    <div>
                      <div className="text-muted-foreground">
                        Current Salary
                      </div>
                      <div className="font-medium">
                        ${application.candidate.currentSalary.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {application.candidate?.expectedSalary && (
                    <div>
                      <div className="text-muted-foreground">
                        Expected Salary
                      </div>
                      <div className="font-medium">
                        ${application.candidate.expectedSalary.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {application.candidate?.noticePeriod && (
                    <div>
                      <div className="text-muted-foreground">Notice Period</div>
                      <div className="font-medium">
                        {application.candidate.noticePeriod}
                      </div>
                    </div>
                  )}
                  {application.candidate?.availabilityToStart && (
                    <div>
                      <div className="text-muted-foreground">
                        Available to Start
                      </div>
                      <div className="font-medium">
                        {format(
                          new Date(application.candidate.availabilityToStart),
                          "PPP"
                        )}
                      </div>
                    </div>
                  )}
                  {application.candidate?.preferredWorkArrangement && (
                    <div>
                      <div className="text-muted-foreground">
                        Preferred Work Style
                      </div>
                      <div className="font-medium capitalize">
                        {application.candidate.preferredWorkArrangement}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                {application.candidate?.skills &&
                  application.candidate.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-md mb-3">
                        Skills & Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {application.candidate.skills.map(
                          (skill: any, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {typeof skill === "string" ? skill : skill.name}
                              {typeof skill === "object" &&
                                skill.proficiency && (
                                  <span className="ml-1 opacity-70">
                                    ({skill.proficiency})
                                  </span>
                                )}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Education */}
                {application.candidate?.education &&
                  application.candidate.education.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-md mb-3">Education</h3>
                      <div className="space-y-3">
                        {application.candidate.education.map(
                          (edu: any, index: number) => (
                            <div
                              key={index}
                              className="border-l-2 border-blue-200 pl-3"
                            >
                              <div className="font-medium">
                                {edu.degree || edu.level}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {edu.institution}
                              </div>
                              {edu.graduationYear && (
                                <div className="text-xs text-muted-foreground">
                                  Graduated: {edu.graduationYear}
                                </div>
                              )}
                              {edu.description && (
                                <div className="text-xs mt-1">
                                  {edu.description}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Certifications */}
              {application.candidate?.certifications &&
                application.candidate.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-md mb-3">
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {application.candidate.certifications.map(
                        (cert: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {cert}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Work History */}
              {application.candidate?.previousEmployment &&
                application.candidate.previousEmployment.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-md mb-3">
                      Employment History
                    </h3>
                    <div className="space-y-4">
                      {application.candidate.previousEmployment.map(
                        (emp: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">
                                  {emp.jobTitle}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {emp.company}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(emp.startDate), "MMM yyyy")} -
                                {emp.endDate
                                  ? format(new Date(emp.endDate), "MMM yyyy")
                                  : "Present"}
                              </div>
                            </div>
                            {emp.description && (
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {emp.description}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Screening Questions */}
              {application.answers &&
                Object.keys(application.answers).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-md mb-3 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Screening Questions & Answers
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(application.answers).map(
                        ([question, answer]: [string, any], index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="font-medium text-sm mb-2">
                              {question}
                            </div>
                            <div className="text-sm border p-3 rounded">
                              {typeof answer === "string"
                                ? answer
                                : JSON.stringify(answer, null, 2)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Match Details */}
                {application.matchDetails && (
                  <div>
                    <h3 className="font-semibold text-md mb-3">
                      AI Match Analysis
                    </h3>
                    <div className="space-y-2">
                      {application.matchDetails.skills && (
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Skills Match</span>
                          <Badge variant="secondary">
                            {application.matchDetails.skills}%
                          </Badge>
                        </div>
                      )}
                      {application.matchDetails.experience && (
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Experience Match</span>
                          <Badge variant="secondary">
                            {application.matchDetails.experience}%
                          </Badge>
                        </div>
                      )}
                      {application.matchDetails.education && (
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Education Match</span>
                          <Badge variant="secondary">
                            {application.matchDetails.education}%
                          </Badge>
                        </div>
                      )}
                      {application.matchDetails.location && (
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Location Match</span>
                          <Badge variant="secondary">
                            {application.matchDetails.location}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Requirements vs Candidate */}
                <div>
                  <h3 className="font-semibold text-md mb-3">
                    Job Requirements
                  </h3>
                  <div className="space-y-3 text-sm">
                    {application.job?.location && (
                      <div>
                        <div className="text-muted-foreground">
                          Work Location
                        </div>
                        <div className="font-medium capitalize">
                          {application.job.location.type}
                          {application.job.location.city && (
                            <span className="text-muted-foreground ml-1">
                              - {application.job.location.city}
                              {application.job.location.state &&
                                `, ${application.job.location.state}`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {application.job?.experienceLevel && (
                      <div>
                        <div className="text-muted-foreground">
                          Experience Level
                        </div>
                        <div className="font-medium capitalize">
                          {application.job.experienceLevel.replace("_", " ")}
                        </div>
                      </div>
                    )}
                    {application.job?.employmentType && (
                      <div>
                        <div className="text-muted-foreground">
                          Employment Type
                        </div>
                        <div className="font-medium capitalize">
                          {application.job.employmentType.replace("_", " ")}
                        </div>
                      </div>
                    )}
                    {application.job?.salary &&
                      application.job.salary.visible && (
                        <div>
                          <div className="text-muted-foreground">
                            Salary Range
                          </div>
                          <div className="font-medium">
                            {application.job.salary.min &&
                            application.job.salary.max
                              ? `$${application.job.salary.min.toLocaleString()} - $${application.job.salary.max.toLocaleString()}`
                              : application.job.salary.min
                              ? `From $${application.job.salary.min.toLocaleString()}`
                              : application.job.salary.max
                              ? `Up to $${application.job.salary.max.toLocaleString()}`
                              : "Competitive"}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Additional Comments & Accommodation */}
              {(application.candidate?.additionalComments ||
                application.candidate?.accommodationNeeds) && (
                <div>
                  <h3 className="font-semibold text-md mb-3">
                    Additional Information
                  </h3>
                  <div className="space-y-3">
                    {application.candidate?.additionalComments && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Additional Comments
                        </div>
                        <div className="text-sm border p-3 rounded">
                          {application.candidate.additionalComments}
                        </div>
                      </div>
                    )}
                    {application.candidate?.accommodationNeeds && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Accommodation Needs
                        </div>
                        <div className="text-sm border p-3 rounded">
                          {application.candidate.accommodationNeeds}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {application.customFields &&
                Object.keys(application.customFields).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-md mb-3">
                      Custom Application Fields
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(application.customFields).map(
                        ([key, value]: [string, any], index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="text-sm text-muted-foreground">
                              {key}
                            </div>
                            <div className="font-medium">
                              {typeof value === "string"
                                ? value
                                : JSON.stringify(value)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              <div>
                <h2 className="font-semibold text-lg mb-2">
                  Application Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Job Title
                    </div>
                    <div className="font-medium">
                      {application.job?.title || "Position not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Company</div>
                    <div className="font-medium">
                      {application.job?.company || "Company not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Applied Date
                    </div>
                    <div className="font-medium">
                      {application.createdAt
                        ? format(new Date(application.createdAt), "PPP")
                        : "N/A"}
                    </div>
                  </div>
                  {application.updatedAt &&
                    application.updatedAt !== application.createdAt && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Last Updated
                        </div>
                        <div className="font-medium">
                          {format(new Date(application.updatedAt), "PPP")}
                        </div>
                      </div>
                    )}
                  {application.source && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Source
                      </div>
                      <div className="font-medium">{application.source}</div>
                    </div>
                  )}
                  {application.matchScore && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Match Score
                      </div>
                      <div className="font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {application.matchScore}%
                        {application.matchDetails?.overall &&
                          application.matchDetails.overall !==
                            application.matchScore && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (Overall: {application.matchDetails.overall}%)
                            </span>
                          )}
                      </div>
                    </div>
                  )}
                  {application.referral?.referredBy && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Referred By
                      </div>
                      <div className="font-medium">
                        {application.referral.referredBy}
                      </div>
                    </div>
                  )}
                  {application.answers &&
                    Object.keys(application.answers).length > 0 && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-muted-foreground mb-2">
                          Screening Questions (
                          {Object.keys(application.answers).length} answered)
                        </div>
                        <div className="space-y-2">
                          {Object.entries(application.answers)
                            .slice(0, 2)
                            .map(
                              (
                                [question, answer]: [string, any],
                                index: number
                              ) => (
                                <div
                                  key={index}
                                  className="text-xs border p-2 rounded"
                                >
                                  <div className="font-medium mb-1 text-muted-foreground">
                                    {question.substring(0, 60)}...
                                  </div>
                                  <div>
                                    {typeof answer === "string"
                                      ? answer.substring(0, 100) +
                                        (answer.length > 100 ? "..." : "")
                                      : JSON.stringify(answer).substring(
                                          0,
                                          100
                                        ) + "..."}
                                  </div>
                                </div>
                              )
                            )}
                          {Object.keys(application.answers).length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{Object.keys(application.answers).length - 2}{" "}
                              more questions answered
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  {application.job?.location && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Work Location
                      </div>
                      <div className="font-medium capitalize">
                        {application.job.location.type}
                        {application.job.location.city && (
                          <span className="text-muted-foreground ml-1">
                            - {application.job.location.city}
                            {application.job.location.state &&
                              `, ${application.job.location.state}`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {application.job?.experienceLevel && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Experience Level
                      </div>
                      <div className="font-medium capitalize">
                        {application.job.experienceLevel.replace("_", " ")}
                      </div>
                    </div>
                  )}
                  {application.job?.employmentType && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Employment Type
                      </div>
                      <div className="font-medium capitalize">
                        {application.job.employmentType.replace("_", " ")}
                      </div>
                    </div>
                  )}
                  {application.job?.salary &&
                    application.job.salary.visible && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Salary Range
                        </div>
                        <div className="font-medium">
                          {application.job.salary.min &&
                          application.job.salary.max
                            ? `$${application.job.salary.min.toLocaleString()} - $${application.job.salary.max.toLocaleString()}`
                            : application.job.salary.min
                            ? `From $${application.job.salary.min.toLocaleString()}`
                            : application.job.salary.max
                            ? `Up to $${application.job.salary.max.toLocaleString()}`
                            : "Competitive"}
                          {application.job.salary.currency &&
                            application.job.salary.currency !== "USD" && (
                              <span className="text-xs text-muted-foreground ml-1">
                                {application.job.salary.currency}
                              </span>
                            )}
                        </div>
                      </div>
                    )}

                  {/* Candidate Professional Details */}
                  {application.candidate?.employmentStatus && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Employment Status
                      </div>
                      <div className="font-medium capitalize">
                        {application.candidate.employmentStatus}
                      </div>
                    </div>
                  )}
                  {application.candidate?.expectedSalary && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Expected Salary
                      </div>
                      <div className="font-medium">
                        ${application.candidate.expectedSalary.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {application.candidate?.noticePeriod && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Notice Period
                      </div>
                      <div className="font-medium">
                        {application.candidate.noticePeriod}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {application.candidate?.skills &&
                    application.candidate.skills.length > 0 && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-muted-foreground mb-2">
                          Key Skills
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {application.candidate.skills
                            .slice(0, 5)
                            .map((skill: any, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {typeof skill === "string" ? skill : skill.name}
                              </Badge>
                            ))}
                          {application.candidate.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.candidate.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Match Breakdown */}
                  {application.matchDetails && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Match Breakdown
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {application.matchDetails.skills && (
                          <div className="flex justify-between">
                            <span>Skills:</span>
                            <Badge variant="secondary" className="text-xs">
                              {application.matchDetails.skills}%
                            </Badge>
                          </div>
                        )}
                        {application.matchDetails.experience && (
                          <div className="flex justify-between">
                            <span>Experience:</span>
                            <Badge variant="secondary" className="text-xs">
                              {application.matchDetails.experience}%
                            </Badge>
                          </div>
                        )}
                        {application.matchDetails.education && (
                          <div className="flex justify-between">
                            <span>Education:</span>
                            <Badge variant="secondary" className="text-xs">
                              {application.matchDetails.education}%
                            </Badge>
                          </div>
                        )}
                        {application.matchDetails.location && (
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <Badge variant="secondary" className="text-xs">
                              {application.matchDetails.location}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {application.customFields &&
                    Object.keys(application.customFields).length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Custom Fields
                        </div>
                        <div className="font-medium">
                          {Object.keys(application.customFields).length}{" "}
                          provided
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Documents & Actions */}
              <div>
                <h3 className="font-semibold text-md mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documents & Actions
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={application.resume?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Resume
                      {application.resume?.parsedData && (
                        <span className="ml-1 text-xs border px-1 rounded">
                          Parsed
                        </span>
                      )}
                    </a>
                  </Button>
                  {application.coverLetter?.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={application.coverLetter.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Cover Letter
                      </a>
                    </Button>
                  )}
                  {application.additionalDocuments &&
                    application.additionalDocuments.length > 0 &&
                    application.additionalDocuments.map(
                      (doc: any, index: number) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {doc.filename || `Document ${index + 1}`}
                            {doc.documentType && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                {doc.documentType}
                              </span>
                            )}
                          </a>
                        </Button>
                      )
                    )}
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${application.candidate?.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for details */}
      <Tabs defaultValue="interviews" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Interviews
                </div>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setShowInterviewDialog(true);
                  }}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Interview
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.interviews && application.interviews.length > 0 ? (
                <div className="space-y-4">
                  {application.interviews.map(
                    (interview: any, index: number) => {
                      const InterviewIcon = getInterviewIcon(interview.type);
                      const StatusIcon = getInterviewStatusIcon(
                        interview.status
                      );

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <InterviewIcon className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium">
                                  {interview.type.charAt(0).toUpperCase() +
                                    interview.type.slice(1)}{" "}
                                  Interview
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(interview.dateTime),
                                    "PPP 'at' p"
                                  )}
                                  {interview.timezone && (
                                    <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {getTimezoneDisplay(interview.timezone)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="flex items-center border">
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {interview.status
                                  ? interview.status.replace("_", " ")
                                  : "unknown"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(interview);
                                  setShowInterviewDialog(true);
                                }}
                                disabled={actionLoading}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteInterview(interview._id)}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
                              <span className="ml-2">
                                {interview.duration} minutes
                              </span>
                            </div>
                            {interview.location && (
                              <div>
                                <span className="text-muted-foreground">
                                  Location:
                                </span>
                                <span className="ml-2">
                                  {interview.location}
                                </span>
                              </div>
                            )}
                            {interview.videoLink && (
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">
                                  Video Link:
                                </span>
                                <a
                                  href={interview.videoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:underline flex items-center"
                                >
                                  Join Meeting{" "}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </div>
                            )}
                          </div>

                          {interview.interviewers &&
                            interview.interviewers.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm text-muted-foreground mb-2">
                                  Interviewers:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {interview.interviewers.map(
                                    (email: string, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="flex items-center"
                                      >
                                        <User className="w-3 h-3 mr-1" />
                                        {email}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {interview.notes && (
                            <div className="mt-3 p-3 border rounded-md">
                              <div className="text-sm text-muted-foreground mb-1">
                                Notes:
                              </div>
                              <div className="text-sm">{interview.notes}</div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No interviews scheduled yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Notes & Comments
                </div>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setShowNoteDialog(true);
                  }}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.notes && application.notes.length > 0 ? (
                <div className="space-y-4">
                  {application.notes.map((note: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-200 pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">
                            {note.createdBy.firstName} {note.createdBy.lastName}
                          </div>
                          <Badge
                            variant={
                              note.visibility === "internal"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {note.visibility}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(note.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItem(note);
                              setShowNoteDialog(true);
                            }}
                            disabled={actionLoading}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNote(note._id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No notes added yet.</p>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setShowNoteDialog(true);
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    Add First Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Review & Evaluation
                </div>
                {application.review ? (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setEditingItem(application.review);
                        setShowReviewDialog(true);
                      }}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Review
                    </Button>
                    <Button
                      onClick={deleteReview}
                      size="sm"
                      variant="outline"
                      disabled={actionLoading}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setShowReviewDialog(true);
                    }}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Review
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.review ? (
                <div className="space-y-6">
                  {/* Rating */}
                  {application.review.rating && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Overall Rating
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= application.review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {application.review.rating}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {application.review.strengths &&
                    application.review.strengths.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Strengths
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {application.review.strengths.map(
                            (strength: string, index: number) => (
                              <li key={index} className="text-sm">
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Weaknesses */}
                  {application.review.weaknesses &&
                    application.review.weaknesses.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Areas for Improvement
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {application.review.weaknesses.map(
                            (weakness: string, index: number) => (
                              <li key={index} className="text-sm">
                                {weakness}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Recommendation */}
                  {application.review.interviewRecommendation !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Interview Recommendation
                      </div>
                      <Badge className="border">
                        {application.review.interviewRecommendation
                          ? "Recommended"
                          : "Not Recommended"}
                      </Badge>
                    </div>
                  )}

                  {/* Feedback */}
                  {application.review.feedback && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Additional Feedback
                      </div>
                      <p className="text-sm border p-3 rounded-md">
                        {application.review.feedback}
                      </p>
                    </div>
                  )}

                  {/* Review metadata */}
                  {application.review.reviewedBy && (
                    <div className="border-t pt-4">
                      <div className="text-xs text-muted-foreground">
                        Reviewed by {application.review.reviewedBy.firstName}{" "}
                        {application.review.reviewedBy.lastName}
                        {application.review.reviewDate && (
                          <span>
                            {" "}
                            on{" "}
                            {format(
                              new Date(application.review.reviewDate),
                              "PPP"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No review completed yet.</p>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setShowReviewDialog(true);
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    Add Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.statusHistory &&
              application.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {application.statusHistory.map(
                    (history: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 pb-4 last:pb-0"
                      >
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Badge className={getStatusColor(history.status)}>
                              {history.status
                                ? history.status.replace("_", " ").toUpperCase()
                                : "UNKNOWN"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(history.date), "PPP 'at' p")}
                            </span>
                          </div>
                          {history.updatedBy && (
                            <div className="text-sm text-muted-foreground">
                              Updated by {history.updatedBy.firstName}{" "}
                              {history.updatedBy.lastName}
                            </div>
                          )}
                          {history.reason && (
                            <div className="text-sm mt-1">{history.reason}</div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No status history available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <InterviewDialog
        open={showInterviewDialog}
        onClose={() => {
          setShowInterviewDialog(false);
          setEditingItem(null);
        }}
        applicationId={application._id}
        interview={editingItem}
        onSuccess={handleSuccess}
      />

      <NoteDialog
        open={showNoteDialog}
        onClose={() => {
          setShowNoteDialog(false);
          setEditingItem(null);
        }}
        applicationId={application._id}
        note={editingItem}
        onSuccess={handleSuccess}
      />

      <ReviewDialog
        open={showReviewDialog}
        onClose={() => {
          setShowReviewDialog(false);
          setEditingItem(null);
        }}
        applicationId={application._id}
        review={editingItem}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
