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
      applied: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      interviewed: "bg-orange-100 text-orange-800",
      offered: "bg-green-100 text-green-800",
      hired: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
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
                  {application.candidate?.firstName}{" "}
                  {application.candidate?.lastName}
                </h1>
                <p className="text-muted-foreground mb-2">
                  {application.candidate?.email}
                </p>
                {application.candidate?.phone && (
                  <p className="text-muted-foreground text-sm">
                    {application.candidate.phone}
                  </p>
                )}
                <Badge className={`mt-3 ${getStatusColor(application.status)}`}>
                  {application.status
                    ? application.status.replace("_", " ").toUpperCase()
                    : "UNKNOWN"}
                </Badge>
              </div>
            </div>

            {/* Application Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="font-semibold text-lg mb-2">
                  Application Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Job Title
                    </div>
                    <div className="font-medium">{application.job?.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Company</div>
                    <div className="font-medium">
                      {application.job?.company}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Applied Date
                    </div>
                    <div className="font-medium">
                      {format(new Date(application.applicationDate), "PPP")}
                    </div>
                  </div>
                  {application.source && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Source
                      </div>
                      <div className="font-medium">{application.source}</div>
                    </div>
                  )}
                  {application.matchingScore && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Match Score
                      </div>
                      <div className="font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {application.matchingScore}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={application.resume?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Resume
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
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${application.candidate?.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </Button>
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
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`flex items-center ${
                                  interview.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : interview.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : interview.status === "no_show"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
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
                                    (interviewer: any, idx: number) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="flex items-center"
                                      >
                                        <User className="w-3 h-3 mr-1" />
                                        {interviewer.firstName}{" "}
                                        {interviewer.lastName}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {interview.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
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
                      <Badge
                        className={
                          application.review.interviewRecommendation
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
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
                      <p className="text-sm bg-gray-50 p-3 rounded-md">
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
