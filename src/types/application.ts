// Application type definitions

export interface ApplicationType {
  _id: string;
  jobId?: string;
  candidateId?: string;
  status:
    | "applied"
    | "screening"
    | "interview"
    | "offer"
    | "hired"
    | "rejected"
    | "withdrawn";
  applicationDate: string;
  resumeId?: string;
  coverLetterId?: string;
  customFieldResponses?: Record<string, unknown>;
  questionResponses?: Array<{
    question: string;
    answer: string;
  }>;
  matchingScore?: {
    overall: number;
    skillsMatch?: number;
    experienceMatch?: number;
    educationMatch?: number;
    breakdown?: Record<string, unknown>;
  };
  statusHistory?: Array<{
    status: string;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }>;
  interviews?: Array<{
    scheduledFor: string;
    duration: number;
    type: "phone" | "video" | "in-person";
    location?: string;
    participants?: string[];
    notes?: string;
    status: "scheduled" | "completed" | "cancelled" | "no-show";
  }>;
  reviews?: Array<{
    reviewer: string;
    rating: number;
    strengths?: string;
    weaknesses?: string;
    notes?: string;
    createdAt: string;
  }>;
  rejectionReason?: string;
  source?: string;
  notes?: Array<{
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
  token?: string;
  createdAt?: string;
  updatedAt?: string;

  // Populated references
  job?: {
    _id: string;
    title: string;
    company: string;
  };
  candidate?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
}
