import { z } from 'zod';

// Schema for application status update
export const applicationStatusSchema = z.object({
  status: z.enum(
    ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
    { errorMap: () => ({ message: "Please select a valid application status" }) }
  ),
  reason: z.string().optional(),
  notifyCandidate: z.boolean().default(true),
});

// Schema for bulk status update
export const bulkStatusUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one application must be selected"),
  status: z.enum(
    ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
    { errorMap: () => ({ message: "Please select a valid application status" }) }
  ),
  reason: z.string().optional(),
  notify: z.boolean().default(true),
});

// Schema for application review
export const applicationReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
});

// Schema for scheduling an interview
export const scheduleInterviewSchema = z.object({
  scheduledFor: z.date(),
  duration: z.number().min(15, "Interview must be at least 15 minutes"),
  type: z.enum(['phone', 'video', 'in-person']),
  location: z.string().optional(),
  participants: z.array(z.string()).optional(),
  notes: z.string().optional(),
  notifyCandidate: z.boolean().default(true),
});

// Type definitions based on the schemas
export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>;
export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
