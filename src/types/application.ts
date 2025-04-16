// Application types
// This is a placeholder file for the type structure

export interface Application {
  id: string;
  job: string;
  candidate: string;
  status: string;
  resume: {
    url: string;
    filename: string;
  };
  coverLetter?: {
    url: string;
    filename: string;
  };
  matchScore?: number;
  notes?: Array<{
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
