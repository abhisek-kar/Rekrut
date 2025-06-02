import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  category: string; // 'general', 'email', 'compliance', etc.
  settings: Record<string, unknown>;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "general",
        "email",
        "compliance",
        "integration",
        "appearance",
        "notification",
      ],
    },
    settings: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Create a unique index on category to ensure only one document per category
SettingSchema.index({ category: 1 }, { unique: true });

// Use function to avoid issues with model compilation in Next.js hot reloading
export default (mongoose.models.Setting as Model<ISetting>) ||
  mongoose.model<ISetting>("Setting", SettingSchema);
