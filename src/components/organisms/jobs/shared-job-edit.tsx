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
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";

interface SharedJobEditProps {
  jobId: string;
  userRole: "admin" | "subadmin";
}

export default function SharedJobEdit({ jobId, userRole }: SharedJobEditProps) {
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
        description: "Set up the application process and requirements",
      },
      {
        title: "Visibility & Promotion",
        description: "Configure how the job will be promoted",
      },
      // {
      //   title: "Custom Fields",
      //   description: "Add any additional fields specific to your organization",
      // },
      {
        title: "Preview & Update",
        description: "Review the changes before updating the job posting",
      },
    ];

    return baseSteps;
  };

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<Partial<JobType> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formValidity, setFormValidity] = useState<Record<string, boolean>>({});
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  const formSteps = getFormSteps();

  // Initialize form validity state
  useEffect(() => {
    const initialValidity: Record<string, boolean> = {};
    formSteps.forEach((_, index) => {
      initialValidity[`step${index + 1}`] = true;
    });
    setFormValidity(initialValidity);
  }, [formSteps.length]);

  // Fetch job data
  useEffect(() => {
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch job data");
      }

      const data = await response.json();

      // Role-based permission checks
      if (userRole === "subadmin") {
        // Verify this job is assigned to the current SubAdmin
        if (data.job.assignedTo?._id !== user?.id) {
          toast.error("You don't have permission to edit this job");
          router.push("/subadmin/jobs");
          return;
        }
      }
      // For admin, no additional permission check needed (can edit all jobs)

      setJobData(data.job);
    } catch (error) {
      console.error("Error fetching job data:", error);
      toast.error("Failed to load job data");
      const redirectPath =
        userRole === "admin" ? "/admin/jobs" : "/subadmin/jobs";
      router.push(redirectPath);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation helpers
  const getBackPath = () => {
    return userRole === "admin"
      ? `/admin/jobs/${jobId}`
      : `/subadmin/jobs/${jobId}`;
  };

  const getJobsListPath = () => {
    return userRole === "admin" ? "/admin/jobs" : "/subadmin/jobs";
  };

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

  const handleConfirmLeave = () => {
    setShowUnsavedChangesModal(false);
    router.push(getBackPath());
  };
  const handleCancelLeave = () => {
    setShowUnsavedChangesModal(false);
  };

  // Check if current step is valid
  const isCurrentStepValid = formValidity[`step${currentStep}`] ?? true;

  // Save job as draft
  const handleSaveAsDraft = async () => {
    if (!jobData) return;

    try {
      setIsSubmitting(true);

      // Prepare job data for saving
      const jobToSave = {
        ...jobData,
        status: "draft",
      };

      // API call to update job
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save job");
      }

      toast.success("Job saved as draft successfully");
      setFormDirty(false);

      // Navigate back to job detail page
      router.push(getBackPath());
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save job as draft"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update and publish job
  const handleUpdateJob = async () => {
    if (!jobData) return;

    try {
      setIsSubmitting(true);

      // Prepare job data for updating
      const jobToUpdate = {
        ...jobData,
        status: jobData.status === "draft" ? "active" : jobData.status,
      };

      // API call to update job
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update job");
      }

      toast.success("Job updated successfully!");

      // Navigate back to job detail page
      router.push(getBackPath());
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update job"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel/back navigation
  const handleCancel = () => {
    if (formDirty) {
      setShowUnsavedChangesModal(true);
    } else {
      router.push(getBackPath());
    }
  };

  // Generate breadcrumb context based on role
  const getBreadcrumbContext = () => {
    const baseContext = {
      [jobId]: jobData?.title || "Job Details",
      edit: "Edit Job",
    };

    if (userRole === "admin") {
      return {
        admin: "Admin",
        jobs: "Jobs Management",
        ...baseContext,
      };
    } else {
      return {
        subadmin: "SubAdmin",
        jobs: "My Jobs",
        ...baseContext,
      };
    }
  };

  // Render the current step form
  const renderStepForm = () => {
    if (!jobData) return null;

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
        return (
          <VisibilityForm
            data={jobData}
            onChange={(data) => handleChange("visibility", data)}
            onValidityChange={(isValid) => handleValidityChange(5, isValid)}
          />
        );
      // case 6:
      //   return (
      //     <CustomFieldsForm
      //       data={jobData}
      //       onChange={(data) => handleChange("customFields", data)}
      //       onValidityChange={(isValid) => handleValidityChange(6, isValid)}
      //     />
      //   );
      case 6:
        return (
          <PreviewForm
            data={jobData}
            onChange={(data) => handleChange("preview", data)}
            onValidityChange={(isValid) => handleValidityChange(6, isValid)}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state while fetching job data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading job data...</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-4">
            The job you're trying to edit doesn't exist or you don't have
            permission to edit it.
          </p>
          <button
            onClick={() => router.push(getJobsListPath())}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <JobFormLayout
        title={`Edit Job: ${jobData.title}`}
        subtitle="Update the job posting details. Changes will be reflected immediately once saved."
        currentStep={currentStep}
        totalSteps={formSteps.length}
        steps={formSteps}
        isSubmitting={isSubmitting}
        isValid={isCurrentStepValid}
        isDirty={formDirty}
        isEdit={true}
        userRole={userRole}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onCancel={handleCancel}
        onSave={handleSaveAsDraft}
        onSubmit={handleUpdateJob}
        cancelUrl={getBackPath()}
        backToText="Back to Job"
        breadcrumbContext={getBreadcrumbContext()}
      >
        {renderStepForm()}
      </JobFormLayout>

      <ConfirmationDialog
        open={showUnsavedChangesModal}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        actionLabel="Leave Without Saving"
        actionVariant="destructive"
        cancelLabel="Stay on Page"
        onAction={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </>
  );
}
