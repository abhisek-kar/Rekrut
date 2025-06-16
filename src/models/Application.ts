import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinProfile?: string;
    portfolioWebsite?: string;

    // Professional Information
    currentJobTitle?: string;
    currentCompany?: string;
    employmentStatus?: string;
    experienceLevel?: string; // e.g., 'entry', 'mid', 'senior', 'lead'
    yearsOfExperience?: number;
    currentSalary?: number;
    currentSalaryCurrency?: string; // e.g., 'INR', 'USD', 'EUR'
    expectedSalary?: number;
    expectedSalaryCurrency?: string; // e.g., 'INR', 'USD', 'EUR'
    noticePeriod?: string;
    availabilityToStart?: Date;
    preferredWorkArrangement?: string;

    // Education & Skills
    education?: Array<{
      level: string;
      degree?: string;
      institution: string;
      graduationYear?: number;
      description?: string;
    }>;
    skills?: string[];
    certifications?: string[];

    // Address
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

    // Additional
    additionalComments?: string;
    accommodationNeeds?: string;
    dateOfBirth?: Date;
    previousEmployment?: Array<{
      company: string;
      jobTitle: string;
      startDate: Date;
      endDate?: Date;
      description?: string;
    }>;
  };
  status: string; // 'applied', 'screened', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'
  statusHistory: Array<{
    status: string;
    date: Date;
    updatedBy?: mongoose.Types.ObjectId;
    reason?: string;
  }>;
  matchScore?: number;
  matchDetails?: {
    skills?: number;
    experience?: number;
    education?: number;
    location?: number;
    overall?: number;
    breakdown?: Record<string, unknown>;
  };
  resume: {
    url: string;
    filename: string;
    parsedData?: Record<string, unknown>;
  };
  coverLetter?: {
    url: string;
    filename: string;
  };
  additionalDocuments?: Array<{
    url: string;
    filename: string;
    documentType?: string;
  }>;
  answers?: Record<string, unknown>; // Answers to screening questions
  notes?: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    visibility: string; // 'internal', 'shared'
  }>;
  interviews?: Array<{
    dateTime: Date;
    duration: number; // in minutes
    type: string; // 'phone', 'video', 'onsite'
    interviewers: string[]; // Email addresses instead of ObjectIds
    location?: string;
    videoLink?: string;
    notes?: string;
    status: string; // 'scheduled', 'completed', 'cancelled', 'no_show'
    timezone?: string;
  }>;
  review?: {
    rating?: number;
    strengths?: string[];
    weaknesses?: string[];
    interviewRecommendation?: boolean;
    feedback?: Record<string, unknown>;
    reviewedBy: mongoose.Types.ObjectId;
    reviewDate: Date;
  };
  source?: string;
  referral?: {
    referredBy?: mongoose.Types.ObjectId;
    referralCode?: string;
  };
  customFields?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      location: { type: String },
      linkedinProfile: { type: String },
      portfolioWebsite: { type: String },

      // Professional Information
      currentJobTitle: { type: String },
      currentCompany: { type: String },
      employmentStatus: { type: String },
      experienceLevel: { type: String },
      yearsOfExperience: { type: Number },
      currentSalary: { type: Number },
      currentSalaryCurrency: { type: String, default: 'INR' },
      expectedSalary: { type: Number },
      expectedSalaryCurrency: { type: String, default: 'INR' },
      noticePeriod: { type: String },
      availabilityToStart: { type: Date },
      preferredWorkArrangement: { type: String },

      // Education & Skills
      education: [
        {
          level: { type: String },
          degree: { type: String },
          institution: { type: String },
          graduationYear: { type: Number },
          description: { type: String },
        },
      ],
      skills: [{ type: String }],
      certifications: [{ type: String }],

      // Address
      currentAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
      permanentAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
      willingToRelocate: { type: Boolean },

      // Additional
      additionalComments: { type: String },
      accommodationNeeds: { type: String },
      dateOfBirth: { type: Date },
      previousEmployment: [
        {
          company: { type: String },
          jobTitle: { type: String },
          startDate: { type: Date },
          endDate: { type: Date },
          description: { type: String },
        },
      ],
    },
    status: {
      type: String,
      required: true,
      default: "applied",
      enum: [
        "applied",
        "screened",
        "interview_scheduled",
        "interviewed",
        "offered",
        "hired",
        "rejected",
      ],
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
          enum: [
            "applied",
            "screened",
            "interview_scheduled",
            "interviewed",
            "offered",
            "hired",
            "rejected",
          ],
        },
        date: { type: Date, default: Date.now, required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
      },
    ],
    matchScore: { type: Number },
    matchDetails: {
      skills: { type: Number },
      experience: { type: Number },
      education: { type: Number },
      location: { type: Number },
      overall: { type: Number },
      breakdown: { type: Schema.Types.Mixed },
    },
    resume: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
      parsedData: { type: Schema.Types.Mixed },
    },
    coverLetter: {
      url: { type: String },
      filename: { type: String },
    },
    additionalDocuments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        documentType: { type: String },
      },
    ],
    answers: { type: Schema.Types.Mixed },
    notes: [
      {
        content: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
        visibility: {
          type: String,
          default: "internal",
          enum: ["internal", "shared"],
        },
      },
    ],
    interviews: [
      {
        dateTime: { type: Date, required: true },
        duration: { type: Number, required: true }, // in minutes
        type: {
          type: String,
          required: true,
          enum: ["phone", "video", "onsite"],
        },
        interviewers: [{ type: String }], // Email addresses
        location: { type: String },
        videoLink: { type: String },
        notes: { type: String },
        status: {
          type: String,
          required: true,
          default: "scheduled",
          enum: ["scheduled", "completed", "cancelled", "no_show"],
        },
        timezone: { type: String, default: "UTC" },
      },
    ],
    review: {
      rating: { type: Number, min: 1, max: 5 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      interviewRecommendation: { type: Boolean },
      feedback: { type: Schema.Types.Mixed },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewDate: { type: Date },
    },
    source: { type: String },
    referral: {
      referredBy: { type: Schema.Types.ObjectId, ref: "User" },
      referralCode: { type: String },
    },
    customFields: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Create indexes for common queries
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ "candidate.email": 1 });
ApplicationSchema.index({ matchScore: -1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ job: 1, "candidate.email": 1 }, { unique: true });

export default (mongoose.models.Application as Model<IApplication>) ||
  mongoose.model<IApplication>("Application", ApplicationSchema);
