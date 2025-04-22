"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobType } from "@/types/job";

// Import job form components
import {
  JobFormLayout,
  BasicInfoForm,
  JobDetailsForm,
  CompensationForm,
  ApplicationSettingsForm,
  VisibilityForm,
  CustomFieldsForm,
  PreviewForm
} from "@/components/organisms/jobs/job-form";

// Define the steps of the job edit form
const formSteps = [
  {
    title: "Basic Information",
    description: "Edit the fundamental details about the job"
  },
  {
    title: "Job Details",
    description: "Modify the job responsibilities and requirements"
  },
  {
    title: "Compensation & Benefits",
    description: "Update salary range and benefits offered"
  },
  {
    title: "Application Settings",
    description: "Adjust the application process and requirements"
  },
  {
    title: "Visibility & Promotion",
    description: "Change how the job will be promoted"
  },
  {
    title: "Custom Fields",
    description: "Edit any additional fields specific to your organization"
  },
  {
    title: "Preview & Update",
    description: "Review the job posting before updating"
  }
];

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<Partial<JobType>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [error, setError] = useState<string | null>(null);

  // Fetch job data when component mounts
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/jobs/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }
        
        const data = await response.json();
        setJobData(data.job);
      } catch (error) {
        console.error("Error fetching job:", error);
        setError("Failed to load job details. Please try again.");
        toast.error("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJob();
  }, [params.id]);

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
  const handleChange = (section: string, data: any) => {
    setJobData(prev => ({
      ...prev,
      ...data
    }));
    setFormDirty(true);
  };

  // Handle form validity changes
  const handleValidityChange = (step: number, isValid: boolean) => {
    setFormValidity(prev => ({
      ...prev,
      [`step${step}`]: isValid
    }));
  };

  // Check if current step is valid
  const isCurrentStepValid = formValidity[`step${currentStep}` as keyof typeof formValidity];

  // Save job updates
  const handleSaveChanges = async (keepStatus: boolean = true) => {
    try {
      setIsSubmitting(true);
      
      // Prepare job data for updating
      const jobToUpdate = {
        ...jobData,
        // Keep the current status if keepStatus is true, otherwise set to draft
        status: keepStatus ? jobData.status : 'draft'
      };
      
      // API call to update job
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToUpdate),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update job");
      }
      
      const result = await response.json();
      
      toast.success("Job updated successfully");
      setFormDirty(false);
      
      // Navigate back to job detail page
      router.push(`/jobs/${params.id}`);
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle publishing draft job
  const handlePublishJob = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare job data for publishing
      const jobToPublish = {
        ...jobData,
        status: "active"
      };
      
      // API call to update and publish job
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobToPublish),
      });
      
      if (!response.ok) {
        throw new Error("Failed to publish job");
      }
      
      const result = await response.json();
      
      toast.success("Job published successfully");
      
      // Navigate back to job detail page
      router.push(`/jobs/${params.id}`);
    } catch (error) {
      console.error("Error publishing job:", error);
      toast.error("Failed to publish job");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing and return to job detail
  const handleCancel = () => {
    if (formDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push(`/jobs/${params.id}`);
      }
    } else {
      router.push(`/jobs/${params.id}`);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={() => router.push(`/jobs/${params.id}`)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return to Job Details
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  // Different action buttons based on job status
  const renderActionButtons = () => {
    if (currentStep === formSteps.length) {
      // Last step - show save/publish/cancel options
      if (jobData.status === 'draft') {
        return {
          primaryAction: {
            label: "Publish Job",
            onClick: handlePublishJob,
          },
          secondaryAction: {
            label: "Save as Draft",
            onClick: () => handleSaveChanges(true),
          },
          cancelAction: {
            label: "Cancel",
            onClick: handleCancel,
          }
        };
      } else {
        return {
          primaryAction: {
            label: "Save Changes",
            onClick: () => handleSaveChanges(true),
          },
          secondaryAction: {
            label: "Save as Draft",
            onClick: () => handleSaveChanges(false),
          },
          cancelAction: {
            label: "Cancel",
            onClick: handleCancel,
          }
        };
      }
    } else {
      // Not last step - show next/previous/save options
      return {
        primaryAction: {
          label: "Next",
          onClick: handleNextStep,
        },
        secondaryAction: {
          label: "Save",
          onClick: () => handleSaveChanges(true),
        },
        cancelAction: {
          label: "Cancel",
          onClick: handleCancel,
        }
      };
    }
  };

  const actions = renderActionButtons();

  return (
    <JobFormLayout
      title="Edit Job"
      currentStep={currentStep}
      totalSteps={formSteps.length}
      steps={formSteps}
      isSubmitting={isSubmitting}
      isValid={isCurrentStepValid}
      isDirty={formDirty}
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
      onSave={actions.secondaryAction.onClick}
      onSubmit={actions.primaryAction.onClick}
      onCancel={actions.cancelAction.onClick}
      primaryLabel={actions.primaryAction.label}
      secondaryLabel={actions.secondaryAction.label}
      cancelLabel={actions.cancelAction.label}
      editMode={true}
    >
      {renderStepForm()}
    </JobFormLayout>
  );
}