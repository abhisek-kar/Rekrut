"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { BreadcrumbItem } from "@/lib/breadcrumbs";

interface Step {
  title: string;
  description: string;
}

interface JobFormLayoutProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  children: ReactNode;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  isEdit?: boolean;
  userRole?: "admin" | "subadmin";
  cancelUrl?: string;
  backToText?: string;
  customBreadcrumbs?: BreadcrumbItem[];
  breadcrumbContext?: Record<string, string>;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
  onSave: () => void;
  onSubmit: () => void;
}

export function JobFormLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  steps,
  children,
  isSubmitting,
  isValid,
  isDirty,
  isEdit = false,
  userRole = "admin",
  cancelUrl,
  backToText,
  customBreadcrumbs,
  breadcrumbContext,
  onNext,
  onPrevious,
  onCancel,
  onSave,
  onSubmit,
}: JobFormLayoutProps) {
  const router = useRouter();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Generate default cancel URL based on user role if not provided
  const defaultCancelUrl = userRole === "admin" ? "/admin/jobs" : "/subadmin/jobs";
  const finalCancelUrl = cancelUrl || defaultCancelUrl;

  // Generate default back text based on user role if not provided
  const defaultBackToText = userRole === "admin" ? "Back to Jobs" : "Back to My Jobs";
  const finalBackToText = backToText || defaultBackToText;

  // Generate step progress description
  const stepProgress = `Step ${currentStep} of ${totalSteps}: ${
    steps[currentStep - 1]?.title
  }`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Use PageHeader instead of manual header */}
      <PageHeader
        title={title}
        description={subtitle || stepProgress}
        customBreadcrumbs={customBreadcrumbs}
        breadcrumbContext={breadcrumbContext}
      />

      {/* Form Steps */}
      <div className="flex flex-wrap gap-2 mb-4 py-4 px-2 mx-auto select-none">
        {steps.map((step, index) => {
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
              <CardDescription>
                {steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter className="flex justify-between pt-6 border-t">
              <div>
                <Button
                  variant="outline"
                  onClick={onCancel || (() => router.push(finalCancelUrl))}
                  disabled={isSubmitting}
                >
                  {finalBackToText}
                </Button>
              </div>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}

                {!isLastStep && (
                  <Button onClick={onNext} disabled={isSubmitting || !isValid}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {isDirty && (
                  <Button
                    variant="outline"
                    onClick={onSave}
                    disabled={isSubmitting || !isValid}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                )}

                {isLastStep && (
                  <Button
                    onClick={onSubmit}
                    disabled={isSubmitting || !isValid}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isEdit ? "Update Job" : "Publish Job"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Form Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mx-4">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <span>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
