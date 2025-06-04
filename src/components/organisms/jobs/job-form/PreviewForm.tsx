"use client";

import React, { useEffect } from "react";
import { Form } from "@/components/shadcn-ui/form";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Separator } from "@/components/shadcn-ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { JobType } from "@/types/job";
import {
  Briefcase,
  MapPin,
  Building,
  Calendar,
  GraduationCap,
  DollarSign,
  Clock,
  FileText,
  Eye,
  Users,
  Globe,
  LockKeyhole,
  Search,
} from "lucide-react";

// Empty schema since we're just previewing
const previewSchema = z.object({});
type PreviewFormValues = z.infer<typeof previewSchema>;

interface PreviewFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

// Job status badges configuration
const statusColors: Record<string, string> = {
  draft: "bg-gray-200 text-gray-800",
  active: "bg-green-100 text-green-800",
  closed: "bg-amber-100 text-amber-800",
  archived: "bg-red-100 text-red-800",
};

// Job type badges configuration
const jobTypeColors: Record<string, string> = {
  "full-time": "bg-blue-100 text-blue-800",
  "part-time": "bg-purple-100 text-purple-800",
  contract: "bg-orange-100 text-orange-800",
  internship: "bg-teal-100 text-teal-800",
};

export function PreviewForm({ data, onValidityChange }: PreviewFormProps) {
  // Initialize the form
  const form = useForm<PreviewFormValues>({
    resolver: zodResolver(previewSchema),
    defaultValues: {},
  });

  // Set form as valid immediately
  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number | undefined, currency = "USD") => {
    if (amount === undefined) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format salary range
  const formatSalaryRange = () => {
    if (!data.salary) return "Not specified";

    const { min, max, currency = "USD" } = data.salary;

    if (min && max) {
      return `${formatCurrency(min, currency)} - ${formatCurrency(
        max,
        currency
      )}`;
    } else if (min) {
      return `From ${formatCurrency(min, currency)}`;
    } else if (max) {
      return `Up to ${formatCurrency(max, currency)}`;
    }

    return "Not specified";
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Tabs defaultValue="candidate" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="candidate">
              <Eye className="mr-2 h-4 w-4" />
              Candidate View
            </TabsTrigger>
            <TabsTrigger value="admin">
              <Users className="mr-2 h-4 w-4" />
              Admin View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidate" className="space-y-6">
            {/* Job Preview Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {data.title || "Job Title"}
                    </CardTitle>
                    <div className="flex items-center mt-2">
                      <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {data.company || "Company"}
                      </span>
                      {data.department && (
                        <>
                          <span className="mx-1 text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {data.department}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={
                        jobTypeColors[data.employmentType || "full-time"]
                      }
                    >
                      {data.employmentType || "Full-time"}
                    </Badge>
                    {data.featured && (
                      <Badge variant="default" className="bg-yellow-500">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {data.location?.type
                        ? data.location.type.charAt(0).toUpperCase() +
                          data.location.type.slice(1)
                        : "Location"}
                      {data.location?.type !== "remote" &&
                        data.location?.city && <> • {data.location.city}</>}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {data.experienceLevel
                        ? `${
                            data.experienceLevel.charAt(0).toUpperCase() +
                            data.experienceLevel.slice(1)
                          } Level`
                        : "Experience"}
                    </span>
                  </div>
                  {data.salary?.visible && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{formatSalaryRange()}</span>
                    </div>
                  )}
                  {data.applicationDeadline && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>
                        Apply by {formatDate(data.applicationDeadline)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Job Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Job Description</h3>
                  <div className="prose max-w-none">
                    {data.description ? (
                      <p>{data.description}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        No job description provided.
                      </p>
                    )}
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Responsibilities</h3>
                  <div className="prose max-w-none">
                    {data.responsibilities ? (
                      <p>{data.responsibilities}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        No responsibilities provided.
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Requirements</h3>
                  <div className="prose max-w-none">
                    {data.requirements ? (
                      <p>{data.requirements}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        No requirements provided.
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {data.skills && data.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Requirements */}
                {data.educationRequirements &&
                  data.educationRequirements.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Education</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.educationRequirements.map((education, index) => (
                          <div key={index} className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{education}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Benefits & Perks */}
                {((data.benefits && data.benefits.length > 0) ||
                  (data.perks && data.perks.length > 0)) && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-medium">Benefits & Perks</h3>

                    {data.benefits && data.benefits.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-md font-medium">Benefits</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.perks && data.perks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-md font-medium">Perks</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.perks.map((perk, index) => (
                            <Badge key={index} variant="outline">
                              {perk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Working Hours */}
                {data.workingHours && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Working Hours</h3>
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <p>{data.workingHours}</p>
                    </div>
                  </div>
                )}

                {/* Application Instructions */}
                {data.applicationInstructions && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      Application Instructions
                    </h3>
                    <p>{data.applicationInstructions}</p>
                  </div>
                )}

                {/* Required Documents */}
                {data.requiredDocuments &&
                  data.requiredDocuments.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        Required Documents
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {data.requiredDocuments.map((document, index) => (
                          <div key={index} className="flex items-center">
                            <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{document}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Application Deadline */}
                {data.applicationDeadline && (
                  <div className="flex items-center mt-4 p-3 bg-muted rounded-md">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <span className="font-medium">Application Deadline:</span>{" "}
                      {formatDate(data.applicationDeadline)}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between pt-6 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted: {formatDate(new Date())}</span>
                </div>
                <Button size="lg" className="bg-primary">
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            {/* Admin Preview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {data.title || "Job Title"}
                    </CardTitle>
                    <div className="flex items-center mt-2">
                      <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {data.company || "Company"}
                      </span>
                      {data.department && (
                        <>
                          <span className="mx-1 text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {data.department}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[data.status || "draft"]}>
                      {data.status
                        ? data.status.charAt(0).toUpperCase() +
                          data.status.slice(1)
                        : "Draft"}
                    </Badge>
                    {data.featured && (
                      <Badge variant="default" className="bg-yellow-500">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Job Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Employment Type
                    </p>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1 text-primary" />
                      <span>{data.employmentType || "Not specified"}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Location
                    </p>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      <span>
                        {data.location?.type
                          ? data.location.type.charAt(0).toUpperCase() +
                            data.location.type.slice(1)
                          : "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Experience Level
                    </p>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-primary" />
                      <span>
                        {data.experienceLevel
                          ? `${
                              data.experienceLevel.charAt(0).toUpperCase() +
                              data.experienceLevel.slice(1)
                            } Level`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Salary Range
                    </p>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-primary" />
                      <span>
                        {formatSalaryRange()}
                        {data.salary?.visible
                          ? " (Visible to candidates)"
                          : " (Not visible to candidates)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Visibility
                    </p>
                    <div className="flex items-center">
                      {data.visibility === "public" ? (
                        <>
                          <Globe className="h-4 w-4 mr-1 text-primary" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <LockKeyhole className="h-4 w-4 mr-1 text-primary" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Application Deadline
                    </p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-primary" />
                      <span>
                        {data.applicationDeadline
                          ? formatDate(data.applicationDeadline)
                          : "No deadline"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Referral Bonus */}
                {data.referralBonus && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                    <span className="font-medium text-amber-800">
                      Referral Bonus:
                    </span>
                    <span className="ml-2 text-amber-800">
                      {data.referralBonus}
                    </span>
                  </div>
                )}

                {/* Internal Notes */}
                {data.internalNotes && (
                  <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-md font-medium text-blue-800">
                      Internal Notes
                    </h3>
                    <p className="text-blue-800">{data.internalNotes}</p>
                    <p className="text-xs text-blue-600">
                      Note: Internal notes are only visible to team members, not
                      candidates
                    </p>
                  </div>
                )}

                {/* Custom Fields */}
                {data.customFields &&
                  Object.keys(data.customFields).length > 0 && (
                    <div className="space-y-4 border p-4 rounded-md">
                      <h3 className="font-medium">Custom Fields</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                        {Object.entries(data.customFields).map(
                          ([key, value]) => (
                            <div key={key} className="sm:col-span-1">
                              <dt className="text-sm font-medium text-muted-foreground">
                                {key}
                              </dt>
                              <dd className="mt-1 text-sm">
                                {typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : String(value) || "Not specified"}
                              </dd>
                            </div>
                          )
                        )}
                      </dl>
                    </div>
                  )}

                {/* SEO Settings */}
                {data.visibility === "public" && (
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="font-medium flex items-center gap-2">
                      <Search className="h-4 w-4 text-green-500" />
                      SEO Settings
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          SEO Title
                        </p>
                        <p>
                          {data.seoTitle ||
                            data.title ||
                            "Default job title will be used"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          SEO Description
                        </p>
                        <p className="text-sm">
                          {data.seoDescription ||
                            "Default job description will be used for search engines"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="space-y-1">
                <h3 className="font-medium text-green-800">Ready to Publish</h3>
                <p className="text-sm text-green-700">
                  Your job posting is ready to be published. Click the
                  &quot;Publish Job&quot; button to make it active.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
