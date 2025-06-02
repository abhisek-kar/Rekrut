import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomField extends Document {
  name: string;
  label: string;
  type: string; // 'text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'date', 'file', 'rating'
  entity: string; // 'job', 'candidate', 'application'
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  helpText?: string;
  validation?: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  defaultValue?: unknown;
  isVisible: boolean;
  visibleTo: string[]; // Roles that can see this field
  order: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomFieldSchema = new Schema<ICustomField>(
  {
    name: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9_]+$/, // Only letters, numbers, and underscores
    },
    label: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "textarea",
        "select",
        "multiselect",
        "checkbox",
        "radio",
        "date",
        "file",
        "rating",
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: ["job", "candidate", "application"],
    },
    options: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    placeholder: { type: String },
    helpText: { type: String },
    validation: {
      required: { type: Boolean, default: false },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String }, // Regex pattern
    },
    defaultValue: { type: Schema.Types.Mixed },
    isVisible: { type: Boolean, default: true },
    visibleTo: [
      {
        type: String,
        enum: ["admin", "subadmin", "candidate"],
      },
    ],
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Create compound unique index for name and entity
CustomFieldSchema.index({ name: 1, entity: 1 }, { unique: true });

// Create indexes for common queries
CustomFieldSchema.index({ entity: 1, order: 1 });
CustomFieldSchema.index({ isVisible: 1 });
CustomFieldSchema.index({ createdBy: 1 });

// Use function to avoid issues with model compilation in Next.js hot reloading
export default (mongoose.models.CustomField as Model<ICustomField>) ||
  mongoose.model<ICustomField>("CustomField", CustomFieldSchema);
