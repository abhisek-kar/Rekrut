// Candidate types
// This is a placeholder file for the type structure

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resume?: {
    url: string;
    filename: string;
  };
  skills?: Array<{
    name: string;
    proficiency?: string;
  }>;
  experience?: string;
  education?: Array<{
    level: string;
    institution: string;
    graduationYear?: number;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}
