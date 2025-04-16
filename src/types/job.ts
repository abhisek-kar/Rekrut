// Job types
// This is a placeholder file for the type structure

export interface Job {
  id: string;
  title: string;
  company: string;
  department?: string;
  location: {
    type: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  description: string;
  requirements?: string;
  skills: string[];
  experienceLevel: string;
  employmentType: string;
  status: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
