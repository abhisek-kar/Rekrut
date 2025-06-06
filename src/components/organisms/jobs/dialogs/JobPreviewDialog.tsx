"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import { Card, CardContent, CardHeader } from "@/components/shadcn-ui/card";
import { Separator } from "@/components/shadcn-ui/separator";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import {
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Star,
  Eye,
  Share2,
  X,
  ExternalLink,
} from "lucide-react";
import { JobType } from "@/types/job";
import { toast } from "sonner";

interface JobPreviewDialogProps {
  job: JobType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobPreviewDialog({
  job,
  isOpen,
  onClose,
}: JobPreviewDialogProps) {
  if (!job) return null;

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

  // Format location
  const formatLocation = (location: any) => {
    if (!location) return "";

    // If location is already a string, return it
    if (typeof location === "string") {
      return location;
    }

    // If location is an object, format it properly
    if (typeof location === "object") {
      // Handle remote work
      if (location.type === "remote") {
        return "Remote";
      }

      // Handle hybrid work
      if (location.type === "hybrid") {
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.state) parts.push(location.state);
        if (location.country && location.country !== "United States")
          parts.push(location.country);
        return parts.length > 0 ? `${parts.join(", ")} (Hybrid)` : "Hybrid";
      }

      // Handle onsite/other location types
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.state) parts.push(location.state);
      if (location.country && location.country !== "United States")
        parts.push(location.country);
      return parts.join(", ");
    }

    return "";
  };

  // Format salary range
  const formatSalaryRange = () => {
    if (!job.salary) return "Competitive salary";

    const { min, max, currency = "USD" } = job.salary;

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

    return "Competitive salary";
  };

  // Job type colors
  const jobTypeColors: Record<string, string> = {
    "full-time": "bg-blue-100 text-blue-800 border-blue-200",
    "part-time": "bg-purple-100 text-purple-800 border-purple-200",
    contract: "bg-orange-100 text-orange-800 border-orange-200",
    internship: "bg-teal-100 text-teal-800 border-teal-200",
  };

  // Copy job link
  const copyJobLink = () => {
    const publicUrl = `${window.location.origin}/apply/${job._id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public job link copied to clipboard");
  };

  // Open job in new tab
  const openInNewTab = () => {
    const publicUrl = `${window.location.origin}/apply/${job._id}`;
    window.open(publicUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl w-full h-[90vh] p-0 overflow-hidden"
        showClose={false}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Job Preview - Public View
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyJobLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={openInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-full">
          <div className="p-6 space-y-6 pb-8">
            {/* Job Header */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
                      {job.title}
                    </h1>
                    <div className="flex items-center mb-3">
                      <Building className="h-5 w-5 mr-2 text-gray-600 flex-shrink-0" />
                      <span className="text-lg text-gray-700 truncate">
                        {job.company || "Company Name"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge
                      className={
                        jobTypeColors[job.employmentType || "full-time"]
                      }
                    >
                      {job.employmentType?.replace("-", " ").toUpperCase() ||
                        "FULL-TIME"}
                    </Badge>
                    {job.featured && (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Job Meta Information */}
                <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-600">
                  <div className="flex items-center min-w-0">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formatLocation(job.location) || "Location not specified"}
                    </span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {job.experienceLevel || "Any level"}
                    </span>
                  </div>
                  {job.salary?.visible && (
                    <div className="flex items-center min-w-0">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{formatSalaryRange()}</span>
                    </div>
                  )}
                  {job.applicationDeadline && (
                    <div className="flex items-center min-w-0">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        Apply by {formatDate(job.applicationDeadline)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Job Description */}
                {job.description && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Job Description
                    </h3>
                    <div
                      className="prose max-w-none text-gray-700 leading-relaxed prose-sm sm:prose-base"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Key Responsibilities
                    </h3>
                    <div
                      className="prose max-w-none text-gray-700 leading-relaxed prose-sm sm:prose-base"
                      dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                    />
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Requirements
                    </h3>
                    <div
                      className="prose max-w-none text-gray-700 leading-relaxed prose-sm sm:prose-base"
                      dangerouslySetInnerHTML={{ __html: job.requirements }}
                    />
                  </div>
                )}

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-50 text-blue-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Requirements */}
                {job.educationRequirements &&
                  job.educationRequirements.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Education Requirements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.educationRequirements.map((education, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-gray-300"
                          >
                            {education}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Benefits & Perks */}
                {((job.benefits && job.benefits.length > 0) ||
                  (job.perks && job.perks.length > 0)) && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Benefits & Perks
                    </h3>

                    {job.benefits && job.benefits.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Benefits</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {job.benefits.map((benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center text-gray-700"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                              <span className="break-words">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.perks && job.perks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Perks</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {job.perks.map((perk, index) => (
                            <div
                              key={index}
                              className="flex items-center text-gray-700"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                              <span className="break-words">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Working Hours */}
                {job.workingHours && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Working Hours
                    </h3>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 mt-1 text-gray-600 flex-shrink-0" />
                      <p className="text-gray-700 break-words">
                        {job.workingHours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Application Instructions */}
                {job.applicationInstructions && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Application Instructions
                    </h3>
                    <p className="text-gray-700 leading-relaxed break-words">
                      {job.applicationInstructions}
                    </p>
                  </div>
                )}

                {/* Required Documents */}
                {job.requiredDocuments && job.requiredDocuments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Required Documents
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {job.requiredDocuments.map((document, index) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-700"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="break-words">{document}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Deadline Warning */}
                {job.applicationDeadline && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium text-amber-800">
                          Application Deadline
                        </p>
                        <p className="text-amber-700 break-words">
                          Applications must be submitted by{" "}
                          {formatDate(job.applicationDeadline)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application CTA */}
            <Card className="bg-primary/5 border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      Ready to Apply?
                    </h3>
                    <p className="text-gray-600">
                      Click the button below to start your application for this
                      position.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white px-8 cursor-default flex-shrink-0"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer Information */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Posted on {formatDate(job.createdAt || new Date())}</p>
              <p className="mt-1 break-all">Job ID: {job._id}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
