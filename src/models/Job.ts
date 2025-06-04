import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  department?: string;
  location?: {
    type: string; // 'remote', 'onsite', 'hybrid'
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  description?: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  experienceLevel?: string; // 'entry', 'mid', 'senior'
  educationRequirements?: string[];
  employmentType?: string; // 'full-time', 'part-time', 'contract', 'internship'
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    visible: boolean;
  };
  benefits?: string[];
  perks?: string[];
  applicationDeadline?: Date;
  expectedStartDate?: Date;
  applicationInstructions?: string;
  requiredDocuments?: string[];
  customFields?: Record<string, unknown>;
  visibility: string; // 'public', 'private'
  featured: boolean;
  status: string; // 'draft', 'active', 'closed', 'archived'
  isTemplate?: boolean; // Whether this is a job template
  templateId?: mongoose.Types.ObjectId; // Reference to template if created from one
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    department: { type: String },
    location: {
      type: {
        type: String,
        required: true,
        enum: ["remote", "onsite", "hybrid"],
      },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    description: { 
      type: String, 
      required: function(this: IJob) {
        // Only required if status is not 'draft'
        return this.status !== 'draft';
      }
    },
    responsibilities: { type: String },
    requirements: { type: String },
    skills: {
      type: [String],
      validate: {
        validator: function(this: IJob, value: string[]) {
          // Skills are required if status is not 'draft'
          if (this.status !== 'draft') {
            return value && value.length > 0;
          }
          return true;
        },
        message: 'At least one skill is required for published jobs'
      }
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior"],
      default: "mid",
      required: function(this: IJob) {
        // Only required if status is not 'draft'
        return this.status !== 'draft';
      }
    },
    educationRequirements: [{ type: String }],
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
      required: function(this: IJob) {
        // Only required if status is not 'draft'
        return this.status !== 'draft';
      }
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
      visible: { type: Boolean, default: false },
    },
    benefits: [{ type: String }],
    perks: [{ type: String }],
    applicationDeadline: { type: Date },
    expectedStartDate: { type: Date },
    applicationInstructions: { type: String },
    requiredDocuments: [{ type: String }],
    customFields: { type: Schema.Types.Mixed },
    visibility: {
      type: String,
      required: true,
      default: "public",
      enum: ["public", "private"],
    },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: ["draft", "active", "closed", "archived"],
    },
    isTemplate: { type: Boolean, default: false },
    templateId: { type: Schema.Types.ObjectId, ref: "Job" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Create indexes for common queries
JobSchema.index({ status: 1 });
JobSchema.index({ assignedTo: 1 });
JobSchema.index({ createdBy: 1 });
JobSchema.index({ visibility: 1, status: 1 });
JobSchema.index({ skills: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ isTemplate: 1 });
JobSchema.index({ templateId: 1 });

// Use function to avoid issues with model compilation in Next.js hot reloading
export default (mongoose.models.Job as Model<IJob>) ||
  mongoose.model<IJob>("Job", JobSchema);
