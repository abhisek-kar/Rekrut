import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
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
    breakdown?: Record<string, any>;
  };
  resume: {
    url: string;
    filename: string;
    parsedData?: Record<string, any>;
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
  answers?: Record<string, any>; // Answers to screening questions
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
    interviewers: mongoose.Types.ObjectId[];
    location?: string;
    videoLink?: string;
    notes?: string;
    status: string; // 'scheduled', 'completed', 'cancelled', 'no_show'
  }>;
  review?: {
    rating?: number;
    strengths?: string[];
    weaknesses?: string[];
    interviewRecommendation?: boolean;
    feedback?: Record<string, any>;
    reviewedBy: mongoose.Types.ObjectId;
    reviewDate: Date;
  };
  source?: string;
  referral?: {
    referredBy?: mongoose.Types.ObjectId;
    referralCode?: string;
  };
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    status: { 
      type: String, 
      required: true, 
      default: 'applied',
      enum: ['applied', 'screened', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected']
    },
    statusHistory: [{
      status: { 
        type: String, 
        required: true,
        enum: ['applied', 'screened', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected']
      },
      date: { type: Date, default: Date.now, required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String }
    }],
    matchScore: { type: Number },
    matchDetails: {
      skills: { type: Number },
      experience: { type: Number },
      education: { type: Number },
      location: { type: Number },
      overall: { type: Number },
      breakdown: { type: Schema.Types.Mixed }
    },
    resume: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
      parsedData: { type: Schema.Types.Mixed }
    },
    coverLetter: {
      url: { type: String },
      filename: { type: String }
    },
    additionalDocuments: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      documentType: { type: String }
    }],
    answers: { type: Schema.Types.Mixed },
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
    interviews: [{
      dateTime: { type: Date, required: true },
      duration: { type: Number, required: true }, // in minutes
      type: { 
        type: String, 
        required: true,
        enum: ['phone', 'video', 'onsite']
      },
      interviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      location: { type: String },
      videoLink: { type: String },
      notes: { type: String },
      status: { 
        type: String, 
        required: true,
        default: 'scheduled',
        enum: ['scheduled', 'completed', 'cancelled', 'no_show']
      }
    }],
    review: {
      rating: { type: Number, min: 1, max: 5 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      interviewRecommendation: { type: Boolean },
      feedback: { type: Schema.Types.Mixed },
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reviewDate: { type: Date }
    },
    source: { type: String },
    referral: {
      referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
      referralCode: { type: String }
    },
    customFields: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Create indexes for common queries
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ candidate: 1 });
ApplicationSchema.index({ matchScore: -1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default (mongoose.models.Application as Model<IApplication>) || 
  mongoose.model<IApplication>('Application', ApplicationSchema);
