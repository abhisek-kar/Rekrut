"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";

// Step component imports
import PersonalInfoStep from "./steps/PersonalInfoStep";
import AddressInfoStep from "./steps/AddressInfoStep";
import ProfessionalDetailsStep from "./steps/ProfessionalDetailsStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import ScreeningQuestionsStep from "./steps/ScreeningQuestionsStep";
import ApplicationSettingsStep from "./steps/ApplicationSettingsStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";

interface Job {
  _id: string;
  slug: string;
  publicId: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    city?: string;
    state?: string;
    country?: string;
  };
  requiredDocuments?: string[];
  screeningQuestions?: Array<{
    id: string;
    question: string;
    required: boolean;
  }>;
  applicationInstructions?: string;
  applicationDeadline?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

export interface ApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;

  // Address Information
  currentAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  permanentAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  isSameAsPermanent?: boolean;
  preferredLocation?: string;

  // Professional Details
  currentRole?: string;
  currentCompany?: string;
  experienceLevel: string;
  skills: string[];
  currentCTC?: number;
  currentCTCCurrency?: string;
  expectedCTC?: number;
  expectedCTCCurrency?: string;
  noticePeriod?: string;

  // Documents - Dynamic based on job requirements
  documents?: {
    [key: string]: File; // Dynamic document uploads based on job.requiredDocuments
  };

  // Screening Questions - Answers to job-specific questions
  screeningAnswers?: {
    [questionId: string]: string; // Question ID -> Answer
  };

  // Application Settings
  availableStartDate?: Date;
  willingToRelocate?: boolean;
  preferredWorkType?: string;
  additionalMessage?: string;
  customFieldAnswers?: {
    [fieldKey: string]: any;
  };
}

interface MultiStepApplicationFormProps {
  job: Job;
  onSubmit: (data: ApplicationData, files: FormData) => Promise<void>;
  onBack?: () => void;
}

const STEPS = [
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Address", description: "Address & location details" },
  { id: 3, title: "Professional", description: "Work experience & skills" },
  { id: 4, title: "Documents", description: "Resume & portfolio" },
  { id: 5, title: "Questions", description: "Screening questions" },
  { id: 6, title: "Preferences", description: "Work preferences" },
  { id: 7, title: "Review", description: "Review & submit" },
];

export default function MultiStepApplicationForm({
  job,
  onSubmit,
  onBack,
}: MultiStepApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experienceLevel: "",
    skills: [],
  });

  // Track initial form state to detect changes
  const [initialApplicationData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experienceLevel: "",
    skills: [],
  });

  // Check for form changes whenever applicationData updates
  useEffect(() => {
    const hasChanges =
      JSON.stringify(applicationData) !==
      JSON.stringify(initialApplicationData);
    setFormDirty(hasChanges);
  }, [applicationData, initialApplicationData]);

  const updateApplicationData = (stepData: Partial<ApplicationData>) => {
    setApplicationData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  // Confirmation dialog handlers
  const handleBackToJobDetails = () => {
    if (formDirty) {
      setShowUnsavedChangesModal(true);
    } else {
      onBack?.();
    }
  };

  const handleConfirmLeave = () => {
    setShowUnsavedChangesModal(false);
    onBack?.();
  };

  const handleCancelLeave = () => {
    setShowUnsavedChangesModal(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      // Add job ID to form data - use slug for security
      formData.append("jobId", job.slug || job.publicId || job._id);
      formData.append("applicationData", JSON.stringify(applicationData));

      // Handle dynamic documents based on job requirements
      if (applicationData.documents) {
        Object.entries(applicationData.documents).forEach(
          ([documentType, file]) => {
            if (file) {
              formData.append(documentType, file);
            }
          }
        );
      }

      await onSubmit(applicationData, formData);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={applicationData}
            updateData={updateApplicationData}
          />
        );
      case 2:
        return (
          <AddressInfoStep
            data={applicationData}
            updateData={updateApplicationData}
          />
        );
      case 3:
        return (
          <ProfessionalDetailsStep
            data={applicationData}
            updateData={updateApplicationData}
            job={job}
          />
        );
      case 4:
        return (
          <DocumentUploadStep
            data={applicationData}
            updateData={updateApplicationData}
            job={job}
          />
        );
      case 5:
        return (
          <ScreeningQuestionsStep
            data={applicationData}
            updateData={updateApplicationData}
            job={job}
          />
        );
      case 6:
        return (
          <ApplicationSettingsStep
            data={applicationData}
            updateData={updateApplicationData}
          />
        );
      case 7:
        return (
          <ReviewSubmitStep
            data={applicationData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            jobTitle={job.title}
            companyName={job.company}
            job={job}
          />
        );
      default:
        return null;
    }
  };

  const getStepProgress = () => {
    return ((currentStep - 1) / (STEPS.length - 1)) * 100;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          applicationData.firstName &&
          applicationData.lastName &&
          applicationData.email
        );
      case 2:
        // Address step - require at least current address or mark as optional
        return true; // Making address step optional for now
      case 3:
        return (
          applicationData.experienceLevel &&
          applicationData.skills.length > 0 &&
          applicationData.expectedCTC // Required field as per our changes
        );
      case 4:
        // Check if all required documents are uploaded
        const requiredDocs = job.requiredDocuments || [];
        if (requiredDocs.length === 0) {
          // If no specific documents required, at least one document should be uploaded
          return (
            applicationData.documents &&
            Object.keys(applicationData.documents).length > 0
          );
        }
        // Check if all required documents are present
        return requiredDocs.every(
          (docType) =>
            applicationData.documents && applicationData.documents[docType]
        );
      case 5:
        // Check if all required screening questions are answered
        const screeningQuestions = job.screeningQuestions || [];
        const requiredQuestions = screeningQuestions.filter((q) => q.required);
        if (requiredQuestions.length === 0) {
          return true; // No required questions
        }
        const answers = applicationData.screeningAnswers || {};
        return requiredQuestions.every(
          (q) => answers[q.id] && answers[q.id].trim().length > 0
        );
      case 6:
        return true; // Optional step
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back to Job Details Button */}
      {onBack && (
        <div className="flex justify-start p-4 border-b">
          <Button
            variant={"ghost"}
            onClick={handleBackToJobDetails}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Button>
        </div>
      )}

      {/* Form Steps Stepper */}
      <div className="flex flex-wrap gap-2 mb-6 py-4 px-2 mx-auto select-none">
        {STEPS.map((step, index) => {
          const stepNumber = step.id;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={stepNumber}
              className={`flex items-center ${index > 0 ? "ml-2" : ""}`}
            >
              {index > 0 && <div className="h-0.5 w-4 bg-border mr-2" />}
              <div
                className={`
                  flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={nextStep} disabled={!validateCurrentStep()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              // Don't show submit button here, it's handled in ReviewSubmitStep
              <div></div>
            )}
          </div>

          {/* Form Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {STEPS.length}
            </span>
            <div className="w-full max-w-xs bg-muted rounded-full h-2 mx-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showUnsavedChangesModal}
        title="Leave Application?"
        description="You have unsaved changes to your job application. If you leave now, your progress will be lost."
        actionLabel="Leave Application"
        actionVariant="destructive"
        cancelLabel="Continue Application"
        onAction={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  );
}
