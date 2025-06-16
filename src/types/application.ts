// Application type definitions

export interface ApplicationType {
  _id: string;
  job: string; // ObjectId reference to Job
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinProfile?: string;
    portfolioWebsite?: string;
    currentJobTitle?: string;
    currentCompany?: string;
    employmentStatus?: string;
    experienceLevel?: string;
    yearsOfExperience?: number;
    currentSalary?: number;
    currentSalaryCurrency?: string;
    expectedSalary?: number;
    expectedSalaryCurrency?: string;
    noticePeriod?: string;
    availabilityToStart?: string;
    preferredWorkArrangement?: string;
    education?: Array<{
      level: string;
      degree?: string;
      institution: string;
      graduationYear?: number;
      description?: string;
    }>;
    skills?: string[];
    certifications?: string[];
    currentAddress?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    permanentAddress?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    willingToRelocate?: boolean;
    additionalComments?: string;
    accommodationNeeds?: string;
    dateOfBirth?: string;
    previousEmployment?: Array<{
      company: string;
      jobTitle: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
  };
  status:
    | "applied"
    | "screening"
    | "interview_scheduled"
    | "interviewed"
    | "offered"
    | "hired"
    | "rejected";
  applicationDate: string;
  resume: {
    url: string;
    filename: string;
  };
  coverLetter?: {
    url: string;
    filename: string;
  };
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
}
