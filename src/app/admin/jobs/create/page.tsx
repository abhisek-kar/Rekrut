"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/shadcn-ui/breadcrumb";
import { SidebarTrigger } from "@/components/shadcn-ui/sidebar";
import { Separator } from "@/components/shadcn-ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Import job creation components
import {
  BasicInfoForm,
  JobDetailsForm,
  CompensationForm,
  ApplicationSettingsForm,
  CustomFieldsForm,
  PreviewForm,
} from "@/components/organisms/jobs/job-form";

// Job type interface - simplified for admin use
interface AdminJobData {
  title: string;
  company: string;
  department?: string;
  location: {
    type: "remote" | "onsite" | "hybrid";
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills: string[];
  experienceLevel: "entry" | "mid" | "senior";
  educationRequirements?: string[];
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    visible: boolean;
  };
  benefits?: string[];
  perks?: string[];
  applicationDeadline?: Date;
  expectedStartDate?: Date;
  applicationInstructions?: string;
  requiredDocuments?: string[];
  customFields?: Record<string, unknown>;
  visibility: "public" | "private";
  featured: boolean;
  status: "draft" | "active" | "closed" | "archived";
  assignedTo?: string; // SubAdmin ID
  createdBy?: string; // Admin ID
}

// Define the steps for admin job creation
const adminFormSteps = [
  {
    title: "Basic Information",
    description: "Enter the fundamental details about the job position",
  },
  {
    title: "Job Details",
    description: "Describe the job responsibilities and requirements",
  },
  {
    title: "Compensation & Benefits",
    description: "Specify salary range and benefits offered",
  },
  {
    title: "Application Settings",
    description: "Configure the application process and requirements",
  },
  {
    title: "Assignment & Visibility",
    description: "Assign to SubAdmin and set visibility options",
  },
  {
    title: "Custom Fields",
    description: "Add any additional fields specific to your organization",
  },
  {
    title: "Preview & Publish",
    description: "Review the job posting before publishing",
  },
];

// Initial job data for admin creation
const initialAdminJobData: Partial<AdminJobData> = {
  title: "",
  company: "",
  department: "",
  location: {
    type: "onsite",
  },
  description: "",
  responsibilities: "",
  requirements: "",
  skills: [],
  experienceLevel: "mid",
  educationRequirements: [],
  employmentType: "full-time",
  salary: {
    visible: false,
  },
  benefits: [],
  perks: [],
  applicationInstructions: "",
  requiredDocuments: [],
  visibility: "public",
  featured: false,
  status: "draft",
};

export default function AdminCreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<Partial<AdminJobData>>(initialAdminJobData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidity, setFormValidity] = useState({
    step1: false,
    step2: false,
    step3: true, // Compensation is optional
    step4: true, // Application settings are optional
    step5: true, // Assignment is optional initially
    step6: true, // Custom fields are optional
    step7: true, // Preview step is always valid
  });
  const [formDirty, setFormDirty] = useState(false);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === adminFormSteps.length;

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < adminFormSteps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle field changes
  const handleChange = (section: string, data: Record<string, unknown>) => {
    setJobData((prev) => ({
      ...prev,
      ...data,
    }));
    setFormDirty(true);
  };

  // Handle form validity changes
  const handleValidityChange = (step: number, isValid: boolean) => {
    setFormValidity((prev) => ({
      ...prev,
      [`step${step}`]: isValid,
    }));
  };

  // Check if current step is valid
  const isCurrentStepValid =
    formValidity[`step${currentStep}` as keyof typeof formValidity];

  // Save job as draft
  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);

      // Add admin-specific data
      const jobToSave = {
        ...jobData,
        status: "draft",
        createdBy: user?.id,
      };

      // API call to save job
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save job");
      }

      const result = await response.json();

      toast.success("Job saved as draft successfully");
      setFormDirty(false);

      // Navigate back to admin jobs page
      router.push("/admin/jobs");
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save job as draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish job
  const handlePublishJob = async () => {
    try {
      setIsSubmitting(true);

      // Add admin-specific data
      const jobToPublish = {
        ...jobData,
        status: "active",
        createdBy: user?.id,
      };

      // API call to publish job
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToPublish),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to publish job");
      }

      const result = await response.json();

      toast.success("Job published successfully!");

      // Navigate back to admin jobs page
      router.push("/admin/jobs");
    } catch (error) {
      console.error("Error publishing job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to publish job");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin-specific Assignment & Visibility Form
  const AdminAssignmentForm = () => {
    const [subAdmins, setSubAdmins] = useState<Array<{id: string, name: string}>>([]);
    const [loading, setLoading] = useState(false);

    // Fetch SubAdmins for assignment
    React.useEffect(() => {
      const fetchSubAdmins = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/admin/users?role=subadmin");
          if (response.ok) {
            const data = await response.json();
            setSubAdmins(data.users?.map((user: any) => ({
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
            })) || []);
          }
        } catch (error) {
          console.error("Error fetching SubAdmins:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubAdmins();
    }, []);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Job Assignment & Visibility</h3>
          <p className="text-muted-foreground mb-6">
            Configure who will manage this job and how it will be visible to candidates.
          </p>
        </div>

        {/* Assignment Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-medium">Assign to SubAdmin</h4>
          <div className="space-y-3">
            <label className="text-sm font-medium">Select SubAdmin (Optional)</label>
            <select
              className="w-full p-2 border rounded-md"
              value={jobData.assignedTo || ""}
              onChange={(e) => handleChange("assignment", { assignedTo: e.target.value || undefined })}
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {subAdmins.map((subAdmin) => (
                <option key={subAdmin.id} value={subAdmin.id}>
                  {subAdmin.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              Assign this job to a specific recruiter or leave unassigned for manual assignment later.
            </p>
          </div>
        </div>

        {/* Visibility Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-medium">Job Visibility</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="public"
                name="visibility"
                value="public"
                checked={jobData.visibility === "public"}
                onChange={(e) => handleChange("visibility", { visibility: e.target.value })}
              />
              <label htmlFor="public" className="text-sm font-medium cursor-pointer">
                Public - Visible on job board
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="private"
                name="visibility"
                value="private"
                checked={jobData.visibility === "private"}
                onChange={(e) => handleChange("visibility", { visibility: e.target.value })}
              />
              <label htmlFor="private" className="text-sm font-medium cursor-pointer">
                Private - Internal use only
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4">
            <input
              type="checkbox"
              id="featured"
              checked={jobData.featured || false}
              onChange={(e) => handleChange("visibility", { featured: e.target.checked })}
            />
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
              Featured Job - Highlight in job listings
            </label>
          </div>
        </div>
      </div>
    );
  };

  // Render the current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm
            data={jobData}
            onChange={(data) => handleChange("basicInfo", data)}
            onValidityChange={(isValid) => handleValidityChange(1, isValid)}
          />
        );
      case 2:
        return (
          <JobDetailsForm
            data={jobData}
            onChange={(data) => handleChange("jobDetails", data)}
            onValidityChange={(isValid) => handleValidityChange(2, isValid)}
          />
        );
      case 3:
        return (
          <CompensationForm
            data={jobData}
            onChange={(data) => handleChange("compensation", data)}
            onValidityChange={(isValid) => handleValidityChange(3, isValid)}
          />
        );
      case 4:
        return (
          <ApplicationSettingsForm
            data={jobData}
            onChange={(data) => handleChange("applicationSettings", data)}
            onValidityChange={(isValid) => handleValidityChange(4, isValid)}
          />
        );
      case 5:
        return <AdminAssignmentForm />;
      case 6:
        return (
          <CustomFieldsForm
            data={jobData}
            onChange={(data) => handleChange("customFields", data)}
            onValidityChange={(isValid) => handleValidityChange(6, isValid)}
          />
        );
      case 7:
        return (
          <PreviewForm
            data={jobData}
            onChange={(data) => handleChange("preview", data)}
            onValidityChange={(isValid) => handleValidityChange(7, isValid)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/jobs">Jobs</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/jobs/create">Create</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
            <p className="text-muted-foreground mt-2">
              Complete the form below to create a new job posting
            </p>
          </div>

          {/* Form Steps */}
          <div className="flex flex-wrap gap-2 mb-4">
            {adminFormSteps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <div
                  key={stepNumber}
                  className={`flex items-center ${index > 0 ? "ml-2" : ""}`}
                >
                  {index > 0 && <div className="h-0.5 w-4 bg-gray-200 mr-2" />}
                  <div
                    className={`
                      flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-primary/20 text-primary"
                          : "bg-gray-100 text-gray-500"
                      }
                    `}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:inline-block
                      ${
                        isActive
                          ? "text-foreground"
                          : isCompleted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    `}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{adminFormSteps[currentStep - 1]?.title}</CardTitle>
              <CardDescription>
                {adminFormSteps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStepForm()}</CardContent>
            <CardFooter className="flex justify-between pt-6 border-t">
              <div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/jobs")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}

                {!isLastStep && (
                  <Button onClick={handleNextStep} disabled={isSubmitting || !isCurrentStepValid}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {formDirty && (
                  <Button
                    variant="outline"
                    onClick={handleSaveAsDraft}
                    disabled={isSubmitting || !isCurrentStepValid}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                )}

                {isLastStep && (
                  <Button
                    onClick={handlePublishJob}
                    disabled={isSubmitting || !isCurrentStepValid}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Publish Job
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Form Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {adminFormSteps.length}
            </span>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mx-4">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(currentStep / adminFormSteps.length) * 100}%` }}
              ></div>
            </div>
            <span>
              {Math.round((currentStep / adminFormSteps.length) * 100)}% Complete
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}