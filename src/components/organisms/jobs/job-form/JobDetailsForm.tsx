"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Button } from "@/components/shadcn-ui/button";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Badge } from "@/components/shadcn-ui/badge";
import { Input } from "@/components/shadcn-ui/input";
import { X, Plus, Info } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { JobType } from "@/types/job";

// Define form validation schema
const jobDetailsSchema = z.object({
  description: z
    .string()
    .min(20, "Job description must be at least 20 characters"),
  responsibilities: z
    .string()
    .min(20, "Responsibilities must be at least 20 characters"),
  requirements: z
    .string()
    .min(20, "Requirements must be at least 20 characters"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  educationRequirements: z.array(z.string()).optional(),
});

type JobDetailsFormValues = z.infer<typeof jobDetailsSchema>;

interface JobDetailsFormProps {
  data: Partial<JobType>;
  onChange: (data: Partial<JobType>) => void;
  onValidityChange: (isValid: boolean) => void;
}

export function JobDetailsForm({
  data,
  onChange,
  onValidityChange,
}: JobDetailsFormProps) {
  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState("");

  // Initialize the form with existing data
  const form = useForm<JobDetailsFormValues>({
    resolver: zodResolver(jobDetailsSchema),
    defaultValues: {
      description: data.description || "",
      responsibilities: data.responsibilities || "",
      requirements: data.requirements || "",
      skills: data.skills || [],
      educationRequirements: data.educationRequirements || [],
    },
    mode: "onChange",
  });

  // Update parent component when form values change
  const onSubmit = (values: JobDetailsFormValues) => {
    onChange(values);
  };

  // Update parent on form validity changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // Get values and check if required fields are filled
      const values = form.getValues();
      const isValid =
        !!values.description &&
        !!values.responsibilities &&
        !!values.requirements &&
        values.skills.length > 0;

      onValidityChange(isValid);

      // Auto-submit the form with current values
      onSubmit(values);
    });

    return () => subscription.unsubscribe();
  }, [form, onValidityChange, onChange, onSubmit]);

  // Add a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !form.getValues().skills.includes(newSkill.trim())) {
      const updatedSkills = [...form.getValues().skills, newSkill.trim()];
      form.setValue("skills", updatedSkills);
      setNewSkill("");
    }
  };

  // Remove a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = form
      .getValues()
      .skills.filter((skill) => skill !== skillToRemove);
    form.setValue("skills", updatedSkills);
  };

  // Add a new education requirement
  const handleAddEducation = () => {
    if (
      newEducation.trim() &&
      !form.getValues().educationRequirements?.includes(newEducation.trim())
    ) {
      const updatedEducation = [
        ...(form.getValues().educationRequirements || []),
        newEducation.trim(),
      ];
      form.setValue("educationRequirements", updatedEducation);
      setNewEducation("");
    }
  };

  // Remove an education requirement
  const handleRemoveEducation = (educationToRemove: string) => {
    const updatedEducation =
      form
        .getValues()
        .educationRequirements?.filter(
          (education) => education !== educationToRemove
        ) || [];
    form.setValue("educationRequirements", updatedEducation);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Job Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Job Description <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a comprehensive description of the job..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include a thorough overview of the role, its purpose within the
                organization, and key objectives
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Responsibilities */}
        <FormField
          control={form.control}
          name="responsibilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Responsibilities <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the day-to-day responsibilities and duties..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detail the specific tasks, responsibilities, and expectations
                for this role
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirements */}
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Requirements <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List the qualifications, experience, and attributes required..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specify the qualifications, experience, and attributes
                candidates should possess
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Skills */}
        <FormField
          control={form.control}
          name="skills"
          render={() => (
            <FormItem>
              <FormLabel>
                Skills <span className="text-destructive">*</span>
              </FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. React, Project Management, Communication"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div>
                  {form.getValues().skills.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No skills added yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {form.getValues().skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="py-1.5 px-2 text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <FormDescription>
                List specific skills required for the role (technical, soft
                skills, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Education Requirements */}
        <FormField
          control={form.control}
          name="educationRequirements"
          render={() => (
            <FormItem>
              <FormLabel>Education Requirements</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Bachelor's in Computer Science, MBA"
                    value={newEducation}
                    onChange={(e) => setNewEducation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEducation();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddEducation} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div>
                  {!form.getValues().educationRequirements?.length ? (
                    <div className="text-sm text-muted-foreground">
                      No education requirements added yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {form
                        ?.getValues()
                        ?.educationRequirements?.map((education, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="py-1.5 px-2 text-sm"
                          >
                            {education}
                            <button
                              type="button"
                              onClick={() => handleRemoveEducation(education)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove</span>
                            </button>
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <FormDescription>
                Specify educational qualifications desired for this position
                (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
