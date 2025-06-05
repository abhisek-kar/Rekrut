"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
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
import { Badge } from "@/components/shadcn-ui/badge";
import { Input } from "@/components/shadcn-ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { X, Plus, Info, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { JobType } from "@/types/job";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Custom ReactQuill wrapper for React Hook Form
interface ReactQuillWrapperProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ReactQuillWrapper = ({
  value,
  onChange,
  placeholder,
  className,
}: ReactQuillWrapperProps) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
  ];

  return (
    <div className={`${className} quill-wrapper`}>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "calc(var(--radius) - 2px)",
        }}
      />
    </div>
  );
};

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

// Common technical skills suggestions
const technicalSkillSuggestions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "HTML/CSS",
  "Angular",
  "Vue.js",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "Kubernetes",
  "GraphQL",
  "REST APIs",
  "Microservices",
];

// Common soft skills suggestions
const softSkillSuggestions = [
  "Communication",
  "Leadership",
  "Problem Solving",
  "Team Collaboration",
  "Project Management",
  "Critical Thinking",
  "Adaptability",
  "Time Management",
  "Analytical Skills",
  "Customer Service",
  "Creativity",
  "Attention to Detail",
  "Conflict Resolution",
  "Public Speaking",
  "Negotiation",
];

// Common education requirements suggestions
const educationSuggestions = [
  "Bachelor's Degree",
  "Master's Degree",
  "High School Diploma",
  "Associate Degree",
  "PhD",
  "Bachelor's in Computer Science",
  "Bachelor's in Engineering",
  "Bachelor's in Business Administration",
  "Master's in Business Administration (MBA)",
  "Bachelor's in Marketing",
  "Bachelor's in Finance",
  "Bachelor's in Psychology",
  "Certification in Project Management",
  "Technical Certification",
  "Professional License",
  "Industry-specific Certification",
];

export function JobDetailsForm({
  data,
  onChange,
  onValidityChange,
}: JobDetailsFormProps) {
  const [newSkill, setNewSkill] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const [aiPopoverOpen, setAiPopoverOpen] = useState<string | null>(null);

  // AI Generation placeholder function (to be implemented)
  const handleAIGeneration = (
    fieldType: "description" | "responsibilities" | "requirements"
  ) => {
    setAiPopoverOpen(fieldType);
    // Auto-close popover after 2 seconds
    setTimeout(() => {
      setAiPopoverOpen(null);
    }, 2000);
  };

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
  const handleAddSkill = (skillText?: string) => {
    const skill = skillText || newSkill.trim();
    if (skill && !form.getValues().skills.includes(skill)) {
      const updatedSkills = [...form.getValues().skills, skill];
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
  const handleAddEducation = (educationText?: string) => {
    const education = educationText || newEducation.trim();
    if (
      education &&
      !form.getValues().educationRequirements?.includes(education)
    ) {
      const updatedEducation = [
        ...(form.getValues().educationRequirements || []),
        education,
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
              <div className="flex items-center justify-between">
                <FormLabel>
                  Job Description <span className="text-destructive">*</span>
                </FormLabel>
                <Popover
                  open={aiPopoverOpen === "description"}
                  onOpenChange={(open) => !open && setAiPopoverOpen(null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIGeneration("description")}
                      className="text-xs h-auto p-1 text-primary hover:text-primary/80 hover:bg-transparent"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate with AI
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3">
                    <div className="text-center">
                      <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Coming Soon!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI-powered content generation will be available soon.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <FormControl>
                <ReactQuillWrapper
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
              <div className="flex items-center justify-between">
                <FormLabel>
                  Responsibilities <span className="text-destructive">*</span>
                </FormLabel>
                <Popover
                  open={aiPopoverOpen === "responsibilities"}
                  onOpenChange={(open) => !open && setAiPopoverOpen(null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIGeneration("responsibilities")}
                      className="text-xs h-auto p-1 text-primary hover:text-primary/80 hover:bg-transparent"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate with AI
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3">
                    <div className="text-center">
                      <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Coming Soon!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI-powered content generation will be available soon.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <FormControl>
                <ReactQuillWrapper
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
              <div className="flex items-center justify-between">
                <FormLabel>
                  Requirements <span className="text-destructive">*</span>
                </FormLabel>
                <Popover
                  open={aiPopoverOpen === "requirements"}
                  onOpenChange={(open) => !open && setAiPopoverOpen(null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIGeneration("requirements")}
                      className="text-xs h-auto p-1 text-primary hover:text-primary/80 hover:bg-transparent"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate with AI
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3">
                    <div className="text-center">
                      <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Coming Soon!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI-powered content generation will be available soon.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <FormControl>
                <ReactQuillWrapper
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
                  <Button
                    type="button"
                    onClick={() => handleAddSkill()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div>
                  {form.getValues().skills.length === 0 ? (
                    <div className="text-sm text-muted-foreground mb-2">
                      No skills added yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
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

                  {/* Technical Skills Suggestions */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Common technical skills:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {technicalSkillSuggestions.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleAddSkill(skill)}
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Soft Skills Suggestions */}
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">
                      Common soft skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {softSkillSuggestions.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleAddSkill(skill)}
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
                  <Button
                    type="button"
                    onClick={() => handleAddEducation()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div>
                  {!form.getValues().educationRequirements?.length ? (
                    <div className="text-sm text-muted-foreground mb-2">
                      No education requirements added yet
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
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

                  {/* Education Suggestions */}
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-2">
                      Common education requirements:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {educationSuggestions.map((education) => (
                        <Badge
                          key={education}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleAddEducation(education)}
                        >
                          + {education}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
