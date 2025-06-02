export type JobLocation = {
  type: "remote" | "onsite" | "hybrid";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export type JobSalary = {
  min?: number;
  max?: number;
  currency?: string;
  visible: boolean;
};

export type JobStatus = "draft" | "active" | "closed" | "archived";
export type JobEmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";
export type JobExperienceLevel = "entry" | "mid" | "senior";
export type JobVisibility = "public" | "private";

export interface JobType {
  _id: string;
  title: string;
  company: string;
  department?: string;
  location: JobLocation;
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills: string[];
  experienceLevel: JobExperienceLevel;
  educationRequirements?: string[];
  employmentType: JobEmploymentType;
  salary?: JobSalary;
  benefits?: string[];
  perks?: string[];
  workingHours?: string;
  referralBonus?: string;
  applicationDeadline?: Date;
  expectedStartDate?: Date;
  applicationInstructions?: string;
  requiredDocuments?: string[];
  customFields?: Record<string, unknown>;
  visibility: JobVisibility;
  seoTitle?: string;
  seoDescription?: string;
  internalNotes?: string;
  featured: boolean;
  status: JobStatus;
  isTemplate?: boolean;
  templateId?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}
