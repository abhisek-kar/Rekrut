"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobType } from "@/types/job";

// Import all form components from the index file
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

// Define the steps of the template creation form
const formSteps = [
  {
    title: "Basic Information",
    description: "Enter the fundamental details about the job template"
  },
  {
    title: "Job Details",
    description: "Describe the job responsibilities and requirements"
  },
  {
    title: "Compensation & Benefits",
    description: "Specify salary range and benefits offered"
  },
  {
    title: "Application Settings",
    description: "Set up the application process and requirements"
  },
  {
    title: "Visibility & Promotion",
    description: "Configure how jobs will be promoted"
  },
  {
    title: "Custom Fields",
    description: "Add any additional fields specific to your organization"
  },
  {
    title: "Preview & Save",
    description: "Review the job template before saving"
  }
];

// Initial job template data
const initialTemplateData: Partial<JobType> = {
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
  isTemplate: true,
};

export default function CreateTemplateJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState(initialTemplateData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValidity, setFormValidity] = useState({
    step1: false,
    step2: false,
    step3: true,  // Compensation is optional
    step4: true,  // Application settings are optional
    step5: true,  // Visibility settings are optional
    step6: true,  // Custom fields are optional
    step7: true,  // Preview step is always valid
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
  const handleChange = (section: string, data: any) => {
    setTemplateData(prev => ({
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

  // Save template as draft
  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare template data for saving
      const templateToSave = {
        ...templateData,
        isTemplate: true,
      };
      
      // API call to save template
      const response = await fetch("/api/jobs/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateToSave),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save template");
      }
      
      const result = await response.json();
      
      toast.success("Template saved as draft successfully");
      setFormDirty(false);
      
      // Navigate to templates page
      router.push('/jobs/templates');
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save template
  const handleSaveTemplate = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare template data for saving
      const templateToSave = {
        ...templateData,
        isTemplate: true,
      };
      
      // API call to save template
      const response = await fetch("/api/jobs/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateToSave),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save template");
      }
      
      const result = await response.json();
      
      toast.success("Template saved successfully");
      
      // Navigate to templates page
      router.push('/jobs/templates');
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoForm 
            data={templateData} 
            onChange={(data) => handleChange("basicInfo", data)}
            onValidityChange={(isValid) => handleValidityChange(1, isValid)}
          />
        );
      case 2:
        return (
          <JobDetailsForm 
            data={templateData} 
            onChange={(data) => handleChange("jobDetails", data)}
            onValidityChange={(isValid) => handleValidityChange(2, isValid)}
          />
        );
      case 3:
        return (
          <CompensationForm 
            data={templateData} 
            onChange={(data) => handleChange("compensation", data)}
            onValidityChange={(isValid) => handleValidityChange(3, isValid)}
          />
        );
      case 4:
        return (
          <ApplicationSettingsForm 
            data={templateData} 
            onChange={(data) => handleChange("applicationSettings", data)}
            onValidityChange={(isValid) => handleValidityChange(4, isValid)}
          />
        );
      case 5:
        return (
          <VisibilityForm 
            data={templateData} 
            onChange={(data) => handleChange("visibility", data)}
            onValidityChange={(isValid) => handleValidityChange(5, isValid)}
          />
        );
      case 6:
        return (
          <CustomFieldsForm 
            data={templateData} 
            onChange={(data) => handleChange("customFields", data)}
            onValidityChange={(isValid) => handleValidityChange(6, isValid)}
          />
        );
      case 7:
        return (
          <PreviewForm 
            data={templateData} 
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
      title="Create Job Template"
      currentStep={currentStep}
      totalSteps={formSteps.length}
      steps={formSteps}
      isSubmitting={isSubmitting}
      isValid={isCurrentStepValid}
      isDirty={formDirty}
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
      onSave={handleSaveAsDraft}
      onSubmit={handleSaveTemplate}
    >
      {renderStepForm()}
    </JobFormLayout>
  );
}
