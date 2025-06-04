"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobType } from "@/types/job";
import { useAuth } from "@/context/AuthContext";

// Import all form components from the index file
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

// Define the steps of the job editing form
const formSteps = [
  {
    title: "Basic Information",
    description: "Enter the fundamental details about the job",
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
  {
    title: "Custom Fields",
    description: "Add any additional fields specific to your organization",
  },
  {
    title: "Preview & Update",
    description: "Review the changes before updating the job posting",
  },
];

export default function SubAdminEditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<Partial<JobType> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formValidity, setFormValidity] = useState({
    step1: true,
    step2: true,
    step3: true,
    step4: true,
    step5: true,
    step6: true,
    step7: true,
  });
  const [formDirty, setFormDirty] = useState(false);

  const jobId = params.id as string;

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
      
      // Verify this job is assigned to the current SubAdmin
      if (data.job.assignedTo?._id !== user?.id) {
        toast.error("You don't have permission to edit this job");
        router.push("/subadmin/jobs");
        return;
      }
      
      setJobData(data.job);
    } catch (error) {
      console.error("Error fetching job data:", error);
      toast.error("Failed to load job data");
      router.push("/subadmin/jobs");
    } finally {
      setIsLoading(false);
    }
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

  // Check if current step is valid
  const isCurrentStepValid =
    formValidity[`step${currentStep}` as keyof typeof formValidity];

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

      const result = await response.json();

      toast.success("Job saved as draft successfully");
      setFormDirty(false);

      // Navigate to SubAdmin job detail page
      router.push(`/subadmin/jobs/${jobId}`);
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save job as draft");
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
        status: jobData.status === "draft" ? "active" : jobData.status, // Use "active" instead of "published"
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

      const result = await response.json();

      toast.success("Job updated successfully!");

      // Navigate to SubAdmin job detail page
      router.push(`/subadmin/jobs/${jobId}`);
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update job");
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
    router.push(`/subadmin/jobs/${jobId}`);
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
            The job you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <button
            onClick={() => router.push("/subadmin/jobs")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
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
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
      onCancel={handleCancel}
      onSave={handleSaveAsDraft}
      onSubmit={handleUpdateJob}
      cancelUrl={`/subadmin/jobs/${jobId}`}
      backToText="Back to Job"
      breadcrumbContext={{
        'subadmin': 'SubAdmin',
        'jobs': 'My Jobs',
        [jobId]: jobData.title || 'Job Details',
        'edit': 'Edit Job'
      }}
    >
      {renderStepForm()}
    </JobFormLayout>
  );
}