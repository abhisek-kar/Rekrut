"use client";

import React from "react";
import MultiStepApplicationForm from "@/components/organisms/application/MultiStepApplicationForm";

const mockJob = {
  _id: "test-job-123",
  title: "Senior Frontend Developer",
  company: "TechCorp Inc.",
  department: "Engineering",
  location: {
    type: "Hybrid",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
  },
  requiredDocuments: ["resume", "portfolio"],
  slug: "senior-frontend-developer",
  publicId: "job-public-123",
};

export default function TestApplicationFormPage() {
  const handleSubmit = async (data: any, files: FormData) => {
    console.log("Application Data:", data);
    console.log("Form Files:", files);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        body: files, // FormData with files and application data
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Application submitted successfully:", result);
        alert(
          `Application submitted successfully! Application ID: ${result.applicationId}`
        );
      } else {
        console.error("Application submission failed:", result);
        alert(
          `Application submission failed: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Check console for details.");
    }
  };

  const handleBack = () => {
    console.log("Back button clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Test Job Application Form
          </h1>
          <p className="text-muted-foreground">
            Testing the new multi-step application form with address and CTC
            fields
          </p>
        </div>

        <MultiStepApplicationForm
          job={mockJob}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
