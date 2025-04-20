import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo: mongoose.Types.ObjectId;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "inProgress" | "completed" | "cancelled";
  taskType: "interview" | "followUp" | "review" | "custom";
  relatedEntityType?: "job" | "application" | "candidate";
  relatedEntityId?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "completed", "cancelled"],
      default: "pending",
    },
    taskType: {
      type: String,
      enum: ["interview", "followUp", "review", "custom"],
      required: true,
    },
    relatedEntityType: {
      type: String,
      enum: ["job", "application", "candidate"],
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for common queries
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
