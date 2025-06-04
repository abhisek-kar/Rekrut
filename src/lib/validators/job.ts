import { z } from 'zod';

// Base job schema for both creation and updates
export const jobSchema = z.object({
  title: z.string()
    .min(3, "Job title must be at least 3 characters")
    .max(100, "Job title must be less than 100 characters"),
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  department: z.string().optional(),
  location: z.object({
    type: z.enum(['remote', 'onsite', 'hybrid'], {
      errorMap: () => ({ message: "Please select a valid location type" })
    }),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  description: z.string()
    .min(10, "Description must be at least 10 characters"),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experienceLevel: z.enum(['entry', 'mid', 'senior'], {
    errorMap: () => ({ message: "Please select a valid experience level" })
  }),
  educationRequirements: z.array(z.string()).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship'], {
    errorMap: () => ({ message: "Please select a valid employment type" })
  }),
  salary: z.object({
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
    currency: z.string().optional(),
    visible: z.boolean().default(false),
  }).optional().refine(data => {
    // If both min and max are provided, ensure min <= max
    if (data?.min != null && data?.max != null) {
      return data.min <= data.max;
    }
    return true;
  }, {
    message: "Minimum salary cannot be greater than maximum salary",
    path: ["min"],
  }),
  benefits: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  applicationDeadline: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        return new Date(val);
      }
      return val;
    },
    z.date().optional().nullable()
  ),
  expectedStartDate: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        return new Date(val);
      }
      return val;
    },
    z.date().optional().nullable()
  ),
  applicationInstructions: z.string().optional(),
  requiredDocuments: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  visibility: z.enum(['public', 'private'], {
    errorMap: () => ({ message: "Please select a valid visibility option" })
  }),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'closed', 'archived'], {
    errorMap: () => ({ message: "Please select a valid status" })
  }),
  isTemplate: z.boolean().optional(),
  templateId: z.string().optional(),
});

// Schema for creating a new job (full validation for published jobs)
export const createJobSchema = jobSchema;

// Schema for creating draft jobs (relaxed validation)
export const createDraftJobSchema = z.object({
  title: z.string()
    .min(3, "Job title must be at least 3 characters")
    .max(100, "Job title must be less than 100 characters"),
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  department: z.string().optional(),
  location: z.object({
    type: z.enum(['remote', 'onsite', 'hybrid'], {
      errorMap: () => ({ message: "Please select a valid location type" })
    }),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  description: z.string().optional(), // Optional for drafts
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  skills: z.array(z.string()).optional(), // Optional for drafts
  experienceLevel: z.enum(['entry', 'mid', 'senior']).optional().default('mid'),
  educationRequirements: z.array(z.string()).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional().default('full-time'),
  salary: z.object({
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
    currency: z.string().optional(),
    visible: z.boolean().default(false),
  }).optional(),
  benefits: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
  applicationDeadline: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        return new Date(val);
      }
      return val;
    },
    z.date().optional().nullable()
  ),
  expectedStartDate: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        return new Date(val);
      }
      return val;
    },
    z.date().optional().nullable()
  ),
  applicationInstructions: z.string().optional(),
  requiredDocuments: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  visibility: z.enum(['public', 'private']).optional().default('public'),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'closed', 'archived'], {
    errorMap: () => ({ message: "Please select a valid status" })
  }),
  isTemplate: z.boolean().optional(),
  templateId: z.string().optional(),
  createdBy: z.string().optional(),
  assignedTo: z.string().optional(),
});

// Schema for updating an existing job
export const updateJobSchema = jobSchema.partial();

// Schema for changing job status
export const jobStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'closed', 'archived'], {
    errorMap: () => ({ message: "Please select a valid status" })
  }),
  reason: z.string().optional(),
});

// Schema for assigning job to SubAdmin
export const jobAssignmentSchema = z.object({
  subadminId: z.string().min(1, "Please select a valid recruiter"),
  notifySubadmin: z.boolean().default(true),
});

// Type definitions based on the schemas
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type CreateDraftJobInput = z.infer<typeof createDraftJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobStatusInput = z.infer<typeof jobStatusSchema>;
export type JobAssignmentInput = z.infer<typeof jobAssignmentSchema>;
