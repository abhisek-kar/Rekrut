import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICandidate extends Document {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  profilePhoto?: string; // URL to S3
  linkedinProfile?: string;
  portfolioWebsite?: string;
  
  // Professional Information
  employmentStatus?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  currentStartDate?: Date;
  currentEndDate?: Date;
  previousEmployment?: Array<{
    company: string;
    jobTitle: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }>;
  skills?: Array<{
    name: string;
    proficiency?: string; // 'beginner', 'intermediate', 'advanced', 'expert'
  }>;
  yearsOfExperience?: number;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  
  // Educational Background
  education?: Array<{
    level: string; // 'highschool', 'bachelor', 'master', 'phd', 'other'
    degree?: string;
    institution: string;
    graduationYear?: number;
    description?: string;
  }>;
  certifications?: string[];
  
  // Address Information
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
  
  // Documents
  resume?: {
    url: string;
    filename: string;
    uploadDate: Date;
  };
  coverLetter?: {
    url: string;
    filename: string;
    uploadDate: Date;
  };
  additionalDocuments?: Array<{
    url: string;
    filename: string;
    documentType?: string;
    uploadDate: Date;
  }>;
  
  // Additional Information
  availabilityToStart?: Date;
  preferredWorkArrangement?: string; // 'remote', 'onsite', 'hybrid'
  source?: string; // how they found the job
  referral?: {
    referredBy?: mongoose.Types.ObjectId;
    referralCode?: string;
  };
  accommodationNeeds?: string;
  additionalComments?: string;
  
  // System Fields
  user?: mongoose.Types.ObjectId; // if they create an account
  status: string; // 'active', 'inactive', 'blacklisted'
  customFields?: Record<string, any>;
  notes?: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    visibility: string; // 'internal', 'shared'
  }>;
  tags?: string[];
  gdprConsent?: {
    consentGiven: boolean;
    consentDate?: Date;
    consentVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    // Personal Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    profilePhoto: { type: String },
    linkedinProfile: { type: String },
    portfolioWebsite: { type: String },
    
    // Professional Information
    employmentStatus: { type: String },
    currentJobTitle: { type: String },
    currentCompany: { type: String },
    currentStartDate: { type: Date },
    currentEndDate: { type: Date },
    previousEmployment: [{
      company: { type: String, required: true },
      jobTitle: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String }
    }],
    skills: [{
      name: { type: String, required: true },
      proficiency: { type: String }
    }],
    yearsOfExperience: { type: Number },
    currentSalary: { type: Number },
    expectedSalary: { type: Number },
    noticePeriod: { type: String },
    
    // Educational Background
    education: [{
      level: { 
        type: String, 
        required: true,
        enum: ['highschool', 'bachelor', 'master', 'phd', 'other']
      },
      degree: { type: String },
      institution: { type: String, required: true },
      graduationYear: { type: Number },
      description: { type: String }
    }],
    certifications: [{ type: String }],
    
    // Address Information
    currentAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },
    permanentAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },
    willingToRelocate: { type: Boolean },
    
    // Documents
    resume: {
      url: { type: String },
      filename: { type: String },
      uploadDate: { type: Date }
    },
    coverLetter: {
      url: { type: String },
      filename: { type: String },
      uploadDate: { type: Date }
    },
    additionalDocuments: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      documentType: { type: String },
      uploadDate: { type: Date, default: Date.now }
    }],
    
    // Additional Information
    availabilityToStart: { type: Date },
    preferredWorkArrangement: { 
      type: String,
      enum: ['remote', 'onsite', 'hybrid']
    },
    source: { type: String },
    referral: {
      referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
      referralCode: { type: String }
    },
    accommodationNeeds: { type: String },
    additionalComments: { type: String },
    
    // System Fields
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      required: true,
      default: 'active',
      enum: ['active', 'inactive', 'blacklisted']
    },
    customFields: { type: Schema.Types.Mixed },
    notes: [{
      content: { type: String, required: true },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      createdAt: { type: Date, default: Date.now },
      visibility: { 
        type: String, 
        default: 'internal',
        enum: ['internal', 'shared']
      }
    }],
    tags: [{ type: String }],
    gdprConsent: {
      consentGiven: { type: Boolean, default: false },
      consentDate: { type: Date },
      consentVersion: { type: String }
    },
  },
  { timestamps: true }
);

// Create indexes for common queries
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ user: 1 });
CandidateSchema.index({ status: 1 });
CandidateSchema.index({ 'skills.name': 1 });
CandidateSchema.index({ createdAt: -1 });

export default (mongoose.models.Candidate as Model<ICandidate>) || 
  mongoose.model<ICandidate>('Candidate', CandidateSchema);
