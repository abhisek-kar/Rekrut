"use client";

import { useState } from "react";
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

// Define the steps of the job creation form
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
    title: "Preview & Publish",
    description: "Review the job posting before publishing",
  },
];

// Initial job data for SubAdmin
const initialJobData: Partial<JobType> = {
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

export default function SubAdminCreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(3);
  const [jobData, setJobData] = useState(initialJobData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidity, setFormValidity] = useState({
    step1: false,
    step2: false,
    step3: true, // Compensation is optional
    step4: true, // Application settings are optional
    step5: true, // Visibility settings are optional
    step6: true, // Custom fields are optional
    step7: true, // Preview step is always valid
  });
  const [formDirty, setFormDirty] = useState(false);

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

  // Save job as draft - SubAdmin specific
  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);

      // Prepare job data for saving with SubAdmin auto-assignment
      const jobToSave = {
        ...jobData,
        status: "draft",
        assignedTo: user?.id, // Auto-assign to current SubAdmin
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

      // Navigate to SubAdmin job detail page
      router.push(`/subadmin/jobs/${result.job._id}`);
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save job as draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish job - SubAdmin specific
  const handlePublishJob = async () => {
    try {
      setIsSubmitting(true);

      // Prepare job data for publishing with SubAdmin auto-assignment
      const jobToPublish = {
        ...jobData,
        status: "published", // Use "published" instead of "active" to match schema
        assignedTo: user?.id, // Auto-assign to current SubAdmin
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

      toast.success("Job published successfully! It's now live and accepting applications.");

      // Navigate to SubAdmin job detail page
      router.push(`/subadmin/jobs/${result.job._id}`);
    } catch (error) {
      console.error("Error publishing job:", error);
      toast.error(error instanceof Error ? error.message : "Failed to publish job");
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
    router.push("/subadmin/jobs");
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

  return (
    <JobFormLayout
      title="Create New Job"
      subtitle="As a SubAdmin, this job will be automatically assigned to you for management"
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
      cancelUrl="/subadmin/jobs"
      backToText="Back to My Jobs"
      breadcrumbContext={{
        'subadmin': 'SubAdmin',
        'jobs': 'My Jobs',
        'create': 'Create New Job'
      }}
    >
      {renderStepForm()}
    </JobFormLayout>
  );
}