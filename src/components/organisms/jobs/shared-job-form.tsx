"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobType } from "@/types/job";
import { useAuth } from "@/context/AuthContext";

import {
  JobFormLayout,
  BasicInfoForm,
  JobDetailsForm,
  CompensationForm,
  ApplicationSettingsForm,
  VisibilityForm,
  CustomFieldsForm,
  PreviewForm,
} from "@/components/organisms/jobs/job-form";

// SubAdmin interface for assignment
interface SubAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SharedJobFormProps {
  userRole: "admin" | "subadmin";
  initialLocationMode?: "remote" | "onsite";
  redirectPath: string;
  breadcrumbContext: Record<string, string>;
}

export default function SharedJobForm({
  userRole,
  initialLocationMode = "remote",
  redirectPath,
  breadcrumbContext,
}: SharedJobFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Define steps based on user role
  const getFormSteps = () => {
    const baseSteps = [
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
    ];

    const step5 =
      userRole === "admin"
        ? {
            title: "Assignment & Visibility",
            description: "Assign to SubAdmin and set visibility options",
          }
        : {
            title: "Visibility & Promotion",
            description: "Configure how the job will be promoted",
          };

    return [
      ...baseSteps,
      step5,
      {
        title: "Custom Fields",
        description: "Add any additional fields specific to your organization",
      },
      {
        title: "Preview & Publish",
        description: "Review the job posting before publishing",
      },
    ];
  };

  const formSteps = getFormSteps();

  // Initial job data
  const initialJobData: Partial<JobType> = {
    title: "",
    company: "",
    department: "",
    location: {
      type: initialLocationMode,
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

  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<Partial<JobType>>(initialJobData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidity, setFormValidity] = useState({
    step1: false,
    step2: false,
    step3: true, // Compensation is optional
    step4: true, // Application settings are optional
    step5: true, // Assignment/Visibility is optional
    step6: true, // Custom fields are optional
    step7: true, // Preview step is always valid
  });
  const [formDirty, setFormDirty] = useState(false);
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loadingSubAdmins, setLoadingSubAdmins] = useState(false);

  // Fetch SubAdmins for assignment (admin only)
  useEffect(() => {
    if (userRole !== "admin") return;

    const fetchSubAdmins = async () => {
      try {
        setLoadingSubAdmins(true);
        const response = await fetch("/api/users/subadmins");
        if (response.ok) {
          const data = await response.json();
          setSubAdmins(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching SubAdmins:", error);
        toast.error("Failed to load SubAdmins for assignment");
      } finally {
        setLoadingSubAdmins(false);
      }
    };

    fetchSubAdmins();
  }, [userRole]);

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < formSteps.length) {
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

      // Prepare job data based on user role
      const jobToSave = {
        ...jobData,
        status: "draft",
        ...(userRole === "admin"
          ? { createdBy: user?.id }
          : { assignedTo: user?.id }),
      };

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

      // Navigate based on user role
      if (userRole === "subadmin") {
        router.push(`/subadmin/jobs/${result.job._id}`);
      } else {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save job as draft"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish job
  const handlePublishJob = async () => {
    try {
      setIsSubmitting(true);

      // Prepare job data based on user role
      const jobToPublish = {
        ...jobData,
        status: "active",
        ...(userRole === "admin"
          ? { createdBy: user?.id }
          : { assignedTo: user?.id }),
      };

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

      toast.success("Job published successfully! It's now live and accepting applications.");

      // Navigate based on user role
      if (userRole === "subadmin") {
        router.push(`/subadmin/jobs/${result.job._id}`);
      } else {
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Error publishing job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to publish job"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel/back navigation
  const handleCancel = () => {
    if (formDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.push(redirectPath);
  };

  // Admin-specific Assignment & Visibility Form (Step 5)
  const AdminAssignmentForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">
            Job Assignment & Visibility
          </h3>
          <p className="text-muted-foreground mb-6">
            Configure who will manage this job and how it will be visible to candidates.
          </p>
        </div>

        {/* Assignment Section */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-medium">Assign to SubAdmin</h4>
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Select SubAdmin (Optional)
            </label>
            {loadingSubAdmins ? (
              <div className="text-sm text-muted-foreground">Loading SubAdmins...</div>
            ) : (
              <select
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={jobData.assignedTo || ""}
                onChange={(e) =>
                  handleChange("assignment", {
                    assignedTo: e.target.value || undefined,
                  })
                }
              >
                <option value="">Unassigned</option>
                {subAdmins.map((subAdmin) => (
                  <option key={subAdmin.id} value={subAdmin.id}>
                    {subAdmin.firstName} {subAdmin.lastName} ({subAdmin.email})
                  </option>
                ))}
              </select>
            )}
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
                onChange={(e) =>
                  handleChange("visibility", { visibility: e.target.value })
                }
                className="focus:ring-primary"
              />
              <label
                htmlFor="public"
                className="text-sm font-medium cursor-pointer"
              >
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
                onChange={(e) =>
                  handleChange("visibility", { visibility: e.target.value })
                }
                className="focus:ring-primary"
              />
              <label
                htmlFor="private"
                className="text-sm font-medium cursor-pointer"
              >
                Private - Internal use only
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 pt-3 border-t">
            <input
              type="checkbox"
              id="featured"
              checked={jobData.featured || false}
              onChange={(e) =>
                handleChange("visibility", { featured: e.target.checked })
              }
              className="focus:ring-primary"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium cursor-pointer"
            >
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
        return userRole === "admin" ? (
          <AdminAssignmentForm />
        ) : (
          <VisibilityForm
            data={jobData}
            onChange={(data) => handleChange("visibility", data)}
            onValidityChange={(isValid) => handleValidityChange(5, isValid)}
          />
        );
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

  const getSubtitle = () => {
    return userRole === "admin"
      ? "As an Admin, you can assign this job to a SubAdmin or manage it yourself"
      : "As a SubAdmin, this job will be automatically assigned to you for management";
  };

  const getCancelUrl = () => {
    return userRole === "admin" ? "/admin/jobs" : "/subadmin/jobs";
  };

  const getBackToText = () => {
    return userRole === "admin" ? "Back to Jobs" : "Back to My Jobs";
  };

  return (
    <JobFormLayout
      title="Create New Job"
      subtitle={getSubtitle()}
      currentStep={currentStep}
      totalSteps={formSteps.length}
      steps={formSteps}
      isSubmitting={isSubmitting}
      isValid={isCurrentStepValid}
      isDirty={formDirty}
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
      onCancel={handleCancel}
      onSave={handleSaveAsDraft}
      onSubmit={handlePublishJob}
      cancelUrl={getCancelUrl()}
      backToText={getBackToText()}
      breadcrumbContext={breadcrumbContext}
    >
      {renderStepForm()}
    </JobFormLayout>
  );
}
