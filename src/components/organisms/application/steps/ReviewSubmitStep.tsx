"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Separator } from "@/components/shadcn-ui/separator";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { 
  User, 
  Briefcase, 
  FileText, 
  Settings, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ApplicationData } from "../MultiStepApplicationForm";

interface ReviewSubmitStepProps {
  data: ApplicationData;
  onSubmit: () => void;
  isSubmitting: boolean;
  jobTitle: string;
  companyName: string;
}

export function ReviewSubmitStep({ 
  data, 
  onSubmit, 
  isSubmitting, 
  jobTitle, 
  companyName 
}: ReviewSubmitStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompletionStatus = () => {
    const sections = [
      { name: 'Personal Information', completed: !!(data.firstName && data.lastName && data.email) },
      { name: 'Professional Details', completed: !!(data.currentRole || data.experienceLevel) },
      { name: 'Documents', completed: !!data.resume },
      { name: 'Application Settings', completed: true }
    ];
    
    const completedCount = sections.filter(s => s.completed).length;
    return { sections, completedCount, total: sections.length };
  };

  const { sections, completedCount, total } = getCompletionStatus();
  const isComplete = completedCount === total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Application</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting your application for{" "}
          <span className="font-semibold">{jobTitle}</span> at{" "}
          <span className="font-semibold">{companyName}</span>
        </p>
      </div>

      {/* Completion Status */}
      <Card className={`border-2 ${isComplete ? 'border-primary/20 bg-primary/5' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isComplete ? (
                <CheckCircle className="h-6 w-6 text-primary" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">
                  {isComplete ? 'Application Complete' : 'Incomplete Sections'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {total} sections completed
                </p>
              </div>
            </div>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {Math.round((completedCount / total) * 100)}%
            </Badge>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${section.completed ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={`text-sm ${section.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                  {section.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Full Name</p>
              <p className="text-sm text-muted-foreground">
                {data.firstName} {data.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{data.email}</p>
              </div>
            </div>
            {data.phone && (
              <div>
                <p className="text-sm font-medium text-foreground">Phone</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{data.phone}</p>
                </div>
              </div>
            )}
            {data.location && (
              <div>
                <p className="text-sm font-medium text-foreground">Location</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{data.location}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Details Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Professional Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.currentRole && (
              <div>
                <p className="text-sm font-medium text-foreground">Current Role</p>
                <p className="text-sm text-muted-foreground">{data.currentRole}</p>
              </div>
            )}
            {data.currentCompany && (
              <div>
                <p className="text-sm font-medium text-foreground">Current Company</p>
                <p className="text-sm text-muted-foreground">{data.currentCompany}</p>
              </div>
            )}
            {data.experienceLevel && (
              <div>
                <p className="text-sm font-medium text-foreground">Experience Level</p>
                <p className="text-sm text-muted-foreground">{data.experienceLevel}</p>
              </div>
            )}
            {data.expectedSalary && (
              <div>
                <p className="text-sm font-medium text-foreground">Expected Salary</p>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">${data.expectedSalary.toLocaleString()}</p>
                </div>
              </div>
            )}
            {data.noticePeriod && (
              <div>
                <p className="text-sm font-medium text-foreground">Notice Period</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{data.noticePeriod}</p>
                </div>
              </div>
            )}
          </div>
          
          {data.skills && data.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            {data.resume && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Resume</p>
                    <p className="text-xs text-muted-foreground">
                      {data.resume.name} ({formatFileSize(data.resume.size)})
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Uploaded</Badge>
              </div>
            )}
            
            {data.coverLetter && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Cover Letter</p>
                    <p className="text-xs text-muted-foreground">
                      {data.coverLetter.name} ({formatFileSize(data.coverLetter.size)})
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Uploaded</Badge>
              </div>
            )}
            
            {data.portfolioFiles && data.portfolioFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Portfolio Files</p>
                {data.portfolioFiles.map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Uploaded</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Preferences Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Application Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {data.availableStartDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Available Start Date</span>
                <Badge variant="outline">
                  {data.availableStartDate.toLocaleDateString()}
                </Badge>
              </div>
            )}
            {data.willingToRelocate !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Willing to Relocate</span>
                <Badge variant={data.willingToRelocate ? "default" : "secondary"}>
                  {data.willingToRelocate ? "Yes" : "No"}
                </Badge>
              </div>
            )}
            {data.preferredWorkType && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Preferred Work Type</span>
                <Badge variant="outline">
                  {data.preferredWorkType}
                </Badge>
              </div>
            )}
            {data.additionalMessage && (
              <div>
                <p className="text-sm font-medium text-foreground">Additional Message</p>
                <p className="text-sm text-muted-foreground mt-1">{data.additionalMessage}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Final Confirmation */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="final-confirmation" 
                checked={true}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <label htmlFor="final-confirmation" className="text-sm font-medium leading-none">
                  I confirm that all the information provided is accurate and complete
                </label>
                <p className="text-xs text-muted-foreground">
                  By submitting this application, you agree that the information provided is true and accurate.
                  Any false information may result in disqualification from the hiring process.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          size="lg"
          className="px-12 py-3"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting Application...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>

      {!isComplete && (
        <div className="text-center text-sm text-muted-foreground">
          Please complete all required sections before submitting your application.
        </div>
      )}
    </div>
  );
}

export default ReviewSubmitStep;
