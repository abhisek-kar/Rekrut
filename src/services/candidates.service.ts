import { apiClient, CacheStrategy } from '@/lib/api-client';

// ===== TYPE DEFINITIONS =====

export interface CandidateAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CandidateSkill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface CandidateEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
  description?: string;
}

export interface CandidateWorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isCurrentPosition?: boolean;
  location?: string;
}

export interface CandidateDocument {
  _id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CandidateNote {
  _id: string;
  note: string;
  visibility: 'public' | 'private';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateApplication {
  _id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'screening' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  applicationDate: Date;
  matchingScore?: number;
}

export interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  status: 'active' | 'inactive' | 'blacklisted';
  
  // Personal Information
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality?: string;
  
  // Contact Information
  currentAddress?: CandidateAddress;
  permanentAddress?: CandidateAddress;
  linkedinProfile?: string;
  portfolioUrl?: string;
  
  // Professional Information
  currentJobTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  skills: CandidateSkill[];
  education: CandidateEducation[];
  workExperience: CandidateWorkExperience[];
  
  // Preferences
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  availabilityDate?: Date;
  noticePeriod?: string;
  
  // System Fields
  source?: 'manual' | 'application' | 'import' | 'referral';
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Calculated Fields (from API responses)
  applicationCount?: number;
  recentApplications?: CandidateApplication[];
}

export interface SubAdminCandidate extends Candidate {
  latestApplicationStatus?: string;
  latestApplicationDate?: Date;
  applications: CandidateApplication[];
}

export interface CandidatesResponse {
  candidates: Candidate[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SubAdminCandidatesResponse {
  candidates: SubAdminCandidate[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    blacklisted: number;
    byApplicationStatus: {
      applied: number;
      screening: number;
      interview_scheduled: number;
      interviewed: number;
      offered: number;
      hired: number;
      rejected: number;
    };
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive';
  currentJobTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  skills?: CandidateSkill[];
  education?: CandidateEducation[];
  workExperience?: CandidateWorkExperience[];
  currentAddress?: CandidateAddress;
  linkedinProfile?: string;
  portfolioUrl?: string;
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  source?: 'manual' | 'application' | 'import' | 'referral';
  tags?: string[];
  notes?: string;
}

export interface UpdateCandidateData extends Partial<CreateCandidateData> {
  profilePhoto?: string;
}

export interface CandidateFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'blacklisted' | '';
  skills?: string;
  experience?: string;
  location?: string;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email' | 'yearsOfExperience' | 'applicationCount';
  sortOrder?: 'asc' | 'desc';
}

export interface SubAdminCandidateFilters extends CandidateFilters {
  applicationStatus?: 'applied' | 'screening' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | '';
}

export interface AddCandidateNoteData {
  note: string;
  visibility: 'public' | 'private';
}

// ===== MAIN CANDIDATES SERVICE =====

export class CandidatesService {
  /**
   * Get all candidates with filtering and pagination
   */
  static async getCandidates(filters: CandidateFilters = {}): Promise<CandidatesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.skills) params.set('skills', filters.skills);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.location) params.set('location', filters.location);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    return apiClient.get<CandidatesResponse>(`/candidates?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 5 * 60 * 1000, // 5 minutes
        key: `candidates_${params.toString()}`
      }
    });
  }

  /**
   * Get candidate by ID
   */
  static async getCandidateById(candidateId: string): Promise<{ candidate: Candidate }> {
    return apiClient.get<{ candidate: Candidate }>(`/candidates/${candidateId}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 10 * 60 * 1000, // 10 minutes
        key: `candidate_${candidateId}`
      }
    });
  }

  /**
   * Create a new candidate
   */
  static async createCandidate(candidateData: CreateCandidateData): Promise<{ candidate: Candidate; message: string }> {
    const result = await apiClient.post<{ candidate: Candidate; message: string }>('/candidates', candidateData);
    
    // Invalidate candidates list cache
    apiClient.invalidateCache('candidates_');
    
    return result;
  }

  /**
   * Update candidate information
   */
  static async updateCandidate(candidateId: string, updateData: UpdateCandidateData): Promise<{ candidate: Candidate; message: string }> {
    const result = await apiClient.put<{ candidate: Candidate; message: string }>(`/candidates/${candidateId}`, updateData);
    
    // Invalidate relevant caches
    apiClient.invalidateCache(`candidate_${candidateId}`);
    apiClient.invalidateCache('candidates_');
    
    return result;
  }

  /**
   * Delete candidate
   */
  static async deleteCandidate(candidateId: string): Promise<{ success: boolean; message: string }> {
    const result = await apiClient.delete<{ success: boolean; message: string }>(`/candidates/${candidateId}`);
    
    // Invalidate relevant caches
    apiClient.invalidateCache(`candidate_${candidateId}`);
    apiClient.invalidateCache('candidates_');
    
    return result;
  }

  /**
   * Get candidate documents
   */
  static async getCandidateDocuments(candidateId: string): Promise<{ documents: CandidateDocument[] }> {
    return apiClient.get<{ documents: CandidateDocument[] }>(`/candidates/${candidateId}/documents`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 15 * 60 * 1000, // 15 minutes
        key: `candidate_documents_${candidateId}`
      }
    });
  }

  /**
   * Add document to candidate
   */
  static async addCandidateDocument(candidateId: string, file: File, type: CandidateDocument['type']): Promise<{ document: CandidateDocument; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const result = await apiClient.upload<{ document: CandidateDocument; message: string }>(`/candidates/${candidateId}/documents`, formData);
    
    // Invalidate documents cache
    apiClient.invalidateCache(`candidate_documents_${candidateId}`);
    
    return result;
  }

  /**
   * Delete candidate document
   */
  static async deleteCandidateDocument(candidateId: string, documentId: string): Promise<{ success: boolean; message: string }> {
    const result = await apiClient.delete<{ success: boolean; message: string }>(`/candidates/${candidateId}/documents/${documentId}`);
    
    // Invalidate documents cache
    apiClient.invalidateCache(`candidate_documents_${candidateId}`);
    
    return result;
  }

  /**
   * Get candidate's application history
   */
  static async getCandidateApplications(candidateId: string): Promise<{ applications: CandidateApplication[] }> {
    return apiClient.get<{ applications: CandidateApplication[] }>(`/candidates/${candidateId}/applications`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 2 * 60 * 1000, // 2 minutes
        key: `candidate_applications_${candidateId}`
      }
    });
  }

  /**
   * Get candidate notes
   */
  static async getCandidateNotes(candidateId: string): Promise<{ notes: CandidateNote[] }> {
    return apiClient.get<{ notes: CandidateNote[] }>(`/candidates/${candidateId}/notes`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 5 * 60 * 1000, // 5 minutes
        key: `candidate_notes_${candidateId}`
      }
    });
  }

  /**
   * Add note to candidate
   */
  static async addCandidateNote(candidateId: string, noteData: AddCandidateNoteData): Promise<{ note: CandidateNote; message: string }> {
    const result = await apiClient.post<{ note: CandidateNote; message: string }>(`/candidates/${candidateId}/notes`, noteData);
    
    // Invalidate notes cache
    apiClient.invalidateCache(`candidate_notes_${candidateId}`);
    
    return result;
  }

  /**
   * Update candidate status
   */
  static async updateCandidateStatus(candidateId: string, status: Candidate['status'], reason?: string): Promise<{ candidate: Candidate; message: string }> {
    const result = await apiClient.put<{ candidate: Candidate; message: string }>(`/candidates/${candidateId}/status`, {
      status,
      reason
    });
    
    // Invalidate relevant caches
    apiClient.invalidateCache(`candidate_${candidateId}`);
    apiClient.invalidateCache('candidates_');
    
    return result;
  }

  /**
   * Search candidates by text query
   */
  static async searchCandidates(query: string, limit: number = 10): Promise<{ candidates: Candidate[] }> {
    const params = new URLSearchParams({
      search: query,
      limit: limit.toString(),
      sortBy: 'relevance'
    });

    return apiClient.get<{ candidates: Candidate[] }>(`/candidates/search?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 5 * 60 * 1000, // 5 minutes
        key: `candidate_search_${query}_${limit}`
      }
    });
  }

  /**
   * Get candidate statistics
   */
  static async getCandidateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    blacklisted: number;
    recentlyAdded: number;
  }> {
    return apiClient.get<{
      total: number;
      active: number;
      inactive: number;
      blacklisted: number;
      recentlyAdded: number;
    }>('/candidates/stats', {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 10 * 60 * 1000, // 10 minutes
        key: 'candidate_stats'
      }
    });
  }

  /**
   * Bulk update candidate status
   */
  static async bulkUpdateCandidateStatus(candidateIds: string[], status: Candidate['status'], reason?: string): Promise<{ success: boolean; count: number; message: string }> {
    const result = await apiClient.post<{ success: boolean; count: number; message: string }>('/candidates/bulk-status', {
      ids: candidateIds,
      status,
      reason
    });
    
    // Invalidate candidates cache
    apiClient.invalidateCache('candidates_');
    candidateIds.forEach(id => {
      apiClient.invalidateCache(`candidate_${id}`);
    });
    
    return result;
  }

  /**
   * Export candidates data
   */
  static async exportCandidates(filters: CandidateFilters = {}, format: 'csv' | 'xlsx' = 'csv'): Promise<{ fileUrl: string; fileName: string }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.skills) params.set('skills', filters.skills);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.location) params.set('location', filters.location);
    params.set('format', format);

    return apiClient.get<{ fileUrl: string; fileName: string }>(`/candidates/export?${params.toString()}`);
  }
}

// ===== SUBADMIN CANDIDATES SERVICE =====

export class SubAdminCandidatesService {
  /**
   * Get candidates who have applied to SubAdmin's assigned jobs
   */
  static async getCandidates(filters: SubAdminCandidateFilters = {}): Promise<SubAdminCandidatesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.applicationStatus) params.set('applicationStatus', filters.applicationStatus);
    if (filters.skills) params.set('skills', filters.skills);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.location) params.set('location', filters.location);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    return apiClient.get<SubAdminCandidatesResponse>(`/subadmin/candidates?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 2 * 60 * 1000, // 2 minutes (shorter for subadmin real-time data)
        key: `subadmin_candidates_${params.toString()}`
      }
    });
  }

  /**
   * Get candidate details for SubAdmin (includes applications to assigned jobs)
   */
  static async getCandidateById(candidateId: string): Promise<{ candidate: SubAdminCandidate }> {
    return apiClient.get<{ candidate: SubAdminCandidate }>(`/subadmin/candidates/${candidateId}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 5 * 60 * 1000, // 5 minutes
        key: `subadmin_candidate_${candidateId}`
      }
    });
  }

  /**
   * Get recent candidates who applied to SubAdmin's jobs
   */
  static async getRecentCandidates(limit: number = 10): Promise<{ candidates: SubAdminCandidate[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy: 'latestApplicationDate',
      sortOrder: 'desc'
    });

    return apiClient.get<{ candidates: SubAdminCandidate[] }>(`/subadmin/candidates/recent?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.NETWORK_FIRST,
        ttl: 1 * 60 * 1000, // 1 minute
        key: `subadmin_recent_candidates_${limit}`
      }
    });
  }

  /**
   * Get candidates by application status for SubAdmin's jobs
   */
  static async getCandidatesByStatus(status: SubAdminCandidate['applications'][0]['status'], page: number = 1, limit: number = 10): Promise<SubAdminCandidatesResponse> {
    const params = new URLSearchParams({
      applicationStatus: status,
      page: page.toString(),
      limit: limit.toString(),
      sortBy: 'latestApplicationDate',
      sortOrder: 'desc'
    });

    return apiClient.get<SubAdminCandidatesResponse>(`/subadmin/candidates?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 3 * 60 * 1000, // 3 minutes
        key: `subadmin_candidates_status_${status}_${page}_${limit}`
      }
    });
  }

  /**
   * Search candidates in SubAdmin's assigned jobs
   */
  static async searchCandidates(query: string, limit: number = 10): Promise<{ candidates: SubAdminCandidate[] }> {
    const params = new URLSearchParams({
      search: query,
      limit: limit.toString(),
      sortBy: 'relevance'
    });

    return apiClient.get<{ candidates: SubAdminCandidate[] }>(`/subadmin/candidates/search?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 2 * 60 * 1000, // 2 minutes
        key: `subadmin_candidate_search_${query}_${limit}`
      }
    });
  }

  /**
   * Add note to candidate (SubAdmin context)
   */
  static async addCandidateNote(candidateId: string, noteData: AddCandidateNoteData): Promise<{ note: CandidateNote; message: string }> {
    const result = await apiClient.post<{ note: CandidateNote; message: string }>(`/subadmin/candidates/${candidateId}/notes`, noteData);
    
    // Invalidate relevant caches
    apiClient.invalidateCache(`subadmin_candidate_${candidateId}`);
    apiClient.invalidateCache(`candidate_notes_${candidateId}`);
    
    return result;
  }

  /**
   * Get candidate statistics for SubAdmin's assigned jobs
   */
  static async getCandidateStats(): Promise<SubAdminCandidatesResponse['stats']> {
    return apiClient.get<SubAdminCandidatesResponse['stats']>('/subadmin/candidates/stats', {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 5 * 60 * 1000, // 5 minutes
        key: 'subadmin_candidate_stats'
      }
    });
  }

  /**
   * Get top candidates for SubAdmin's jobs (by matching score)
   */
  static async getTopCandidates(jobId?: string, limit: number = 10): Promise<{ candidates: SubAdminCandidate[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sortBy: 'matchingScore',
      sortOrder: 'desc'
    });

    if (jobId) {
      params.set('jobId', jobId);
    }

    return apiClient.get<{ candidates: SubAdminCandidate[] }>(`/subadmin/candidates/top-matches?${params.toString()}`, {
      cache: {
        strategy: CacheStrategy.CACHE_FIRST,
        ttl: 10 * 60 * 1000, // 10 minutes
        key: `subadmin_top_candidates_${jobId}_${limit}`
      }
    });
  }

  /**
   * Export SubAdmin's candidates data
   */
  static async exportCandidates(filters: SubAdminCandidateFilters = {}, format: 'csv' | 'xlsx' = 'csv'): Promise<{ fileUrl: string; fileName: string }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.applicationStatus) params.set('applicationStatus', filters.applicationStatus);
    if (filters.skills) params.set('skills', filters.skills);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.location) params.set('location', filters.location);
    params.set('format', format);

    return apiClient.get<{ fileUrl: string; fileName: string }>(`/subadmin/candidates/export?${params.toString()}`);
  }
}
