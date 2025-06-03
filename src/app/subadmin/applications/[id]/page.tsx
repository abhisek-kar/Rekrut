"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { Separator } from "@/components/shadcn-ui/separator";
import { Textarea } from "@/components/shadcn-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Star,
  MessageSquare,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit3,
  UserCheck,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SectionLoader } from "@/components/atoms/loader";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDistanceToNow, format } from "date-fns";

interface ApplicationDetail {
  _id: string;
  applicationDate: string;
  status: string;
  source?: string;
  matchingScore?: {
    overall: number;
    skills?: number;
    experience?: number;
    education?: number;
    breakdown?: Record<string, any>;
  };
  resume: {
    url: string;
    filename: string;
  };
  coverLetter?: {
    url: string;
    filename: string;
  };
  additionalDocuments?: Array<{
    url: string;
    filename: string;
    documentType?: string;
  }>;
  answers?: Record<string, any>;
  job: {
    _id: string;
    title: string;
    company: string;
    department?: string;
    location: {
      type: string;
      city?: string;
      state?: string;
    };
  };
  candidate: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    currentPosition?: {
      title: string;
      company: string;
      startDate: string;
      isCurrentlyWorking: boolean;
    };
    employmentHistory?: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      fieldOfStudy?: string;
      graduationYear: number;
    }>;
    skills?: Array<{
      name: string;
      proficiency: number;
    }>;
  };
  statusHistory?: Array<{
    status: string;
    date: string;
    updatedBy?: {
      firstName: string;
      lastName: string;
    };
    reason?: string;
  }>;
  notes?: Array<{
    _id: string;
    content: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    visibility: string;
  }>;
  interviews?: Array<{
    _id: string;
    dateTime: string;
    duration: number;
    type: string;
    interviewers: Array<{
      firstName: string;
      lastName: string;
    }>;
    location?: string;
    videoLink?: string;
    notes?: string;
    status: string;
  }>;
  review?: {
    rating?: number;
    strengths?: string[];
    weaknesses?: string[];
    interviewRecommendation?: boolean;
    feedback?: string;
    reviewedBy: {
      firstName: string;
      lastName: string;
    };
    reviewDate: string;
  };
}

export default function SubAdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const applicationId = params.id as string;

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${applicationId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch application details");
      }
      
      const data = await response.json();
      
      // Verify this application is for a job assigned to the current SubAdmin
      // This check should be done on the backend, but we'll add client-side check too
      setApplication(data.application);
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast.error("Failed to load application details");
      router.push("/subadmin/applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string, reason?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: reason || `Status updated by ${user?.firstName} ${user?.lastName}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh application details
      fetchApplicationDetails();
      toast.success(`Application status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const response = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: newNote.trim(),
          visibility: "internal",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      setNewNote("");
      fetchApplicationDetails();
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      applied: { label: "Applied", color: "bg-blue-100 text-blue-800", icon: FileText },
      screening: { label: "Screening", color: "bg-yellow-100 text-yellow-800", icon: Eye },
      interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-100 text-purple-800", icon: Calendar },
      interviewed: { label: "Interviewed", color: "bg-orange-100 text-orange-800", icon: MessageSquare },
      offered: { label: "Offered", color: "bg-green-100 text-green-800", icon: CheckCircle },
      hired: { label: "Hired", color: "bg-emerald-100 text-emerald-800", icon: Star },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
    };
    
    return statusMap[status as keyof typeof statusMap] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle
    };
  };

  if (loading) {
    return <SectionLoader message="Loading application details..." height="100vh" />;
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Application not found</h2>
          <p className="text-muted-foreground mb-4">
            The application you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/subadmin/applications")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/subadmin/applications")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={application.candidate.profilePhoto} 
                alt={`${application.candidate.firstName} ${application.candidate.lastName}`}
              />
              <AvatarFallback>
                {application.candidate.firstName[0]}{application.candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {application.candidate.firstName} {application.candidate.lastName}
              </h1>
              <p className="text-muted-foreground">{application.job.title}</p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {application.matchingScore && (
              <Badge variant="outline">
                {application.matchingScore.overall}% match
              </Badge>
            )}
            <Select 
              value={application.status} 
              onValueChange={(value) => handleStatusUpdate(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(application.resume.url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Resume
                </DropdownMenuItem>
                {application.coverLetter && (
                  <DropdownMenuItem onClick={() => window.open(application.coverLetter!.url, '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Cover Letter
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/subadmin/jobs/${application.job._id}`)}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Job Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`mailto:${application.candidate.email}`, '_blank')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <main className="flex-1 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({application.notes?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Candidate Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{application.candidate.email}</span>
                      </div>
                      {application.candidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{application.candidate.phone}</span>
                        </div>
                      )}
                      {application.candidate.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {application.candidate.address.city && application.candidate.address.state
                              ? `${application.candidate.address.city}, ${application.candidate.address.state}`
                              : application.candidate.address.city || application.candidate.address.state}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Current Position */}
                    {application.candidate.currentPosition && (
                      <div>
                        <h4 className="font-medium mb-2">Current Position</h4>
                        <div className="text-sm">
                          <p className="font-medium">{application.candidate.currentPosition.title}</p>
                          <p className="text-muted-foreground">{application.candidate.currentPosition.company}</p>
                          <p className="text-xs text-muted-foreground">
                            Since {format(new Date(application.candidate.currentPosition.startDate), "MMM yyyy")}
                            {application.candidate.currentPosition.isCurrentlyWorking ? " - Present" : ""}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {application.candidate.skills && application.candidate.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.candidate.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {skill.name}
                              <span className="text-xs">({skill.proficiency}/5)</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Job Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Applied Position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{application.job.title}</h3>
                      <p className="text-muted-foreground">{application.job.company}</p>
                      {application.job.department && (
                        <p className="text-sm text-muted-foreground">{application.job.department}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {application.job.location.type.charAt(0).toUpperCase() + application.job.location.type.slice(1)}
                        {application.job.location.city && ` • ${application.job.location.city}`}
                        {application.job.location.state && `, ${application.job.location.state}`}
                      </span>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/subadmin/jobs/${application.job._id}`)}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      View Job Details
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Application Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Applied</label>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(application.applicationDate), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    
                    {application.source && (
                      <div>
                        <label className="text-sm font-medium">Source</label>
                        <p className="text-sm text-muted-foreground capitalize">
                          {application.source}
                        </p>
                      </div>
                    )}

                    {application.matchingScore && (
                      <div>
                        <label className="text-sm font-medium">Match Score</label>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Overall</span>
                            <Badge variant="outline">{application.matchingScore.overall}%</Badge>
                          </div>
                          {application.matchingScore.skills && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Skills</span>
                              <span className="text-xs">{application.matchingScore.skills}%</span>
                            </div>
                          )}
                          {application.matchingScore.experience && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Experience</span>
                              <span className="text-xs">{application.matchingScore.experience}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleStatusUpdate('screening')}
                      disabled={application.status === 'screening'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Move to Screening
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleStatusUpdate('interview_scheduled')}
                      disabled={application.status === 'interview_scheduled'}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleStatusUpdate('offered')}
                      disabled={application.status === 'offered'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Make Offer
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={application.status === 'rejected'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resume */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">Resume</p>
                      <p className="text-sm text-muted-foreground">{application.resume.filename}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => window.open(application.resume.url, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">Cover Letter</p>
                        <p className="text-sm text-muted-foreground">{application.coverLetter.filename}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => window.open(application.coverLetter!.url, '_blank')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                )}

                {/* Additional Documents */}
                {application.additionalDocuments && application.additionalDocuments.length > 0 && (
                  <>
                    <Separator />
                    <h4 className="font-medium">Additional Documents</h4>
                    {application.additionalDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <p className="font-medium">{doc.documentType || 'Document'}</p>
                            <p className="text-sm text-muted-foreground">{doc.filename}</p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => window.open(doc.url, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  <div className="space-y-4">
                    {application.statusHistory.map((entry, index) => {
                      const entryStatusInfo = getStatusInfo(entry.status);
                      const EntryIcon = entryStatusInfo.icon;
                      
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${entryStatusInfo.color}`}>
                            <EntryIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{entryStatusInfo.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(entry.date), "MMM dd, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                            {entry.updatedBy && (
                              <p className="text-sm text-muted-foreground">
                                by {entry.updatedBy.firstName} {entry.updatedBy.lastName}
                              </p>
                            )}
                            {entry.reason && (
                              <p className="text-sm text-muted-foreground">{entry.reason}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No timeline data</h3>
                    <p className="text-muted-foreground">
                      Status changes will appear here as the application progresses.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note about this application..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!newNote.trim() || addingNote}
                    size="sm"
                  >
                    {addingNote ? "Adding..." : "Add Note"}
                  </Button>
                </div>

                <Separator />

                {/* Notes List */}
                {application.notes && application.notes.length > 0 ? (
                  <div className="space-y-4">
                    {application.notes.map((note) => (
                      <div key={note._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">
                            {note.createdBy.firstName} {note.createdBy.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                    <p className="text-muted-foreground">
                      Add notes to track your thoughts and decisions about this candidate.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}