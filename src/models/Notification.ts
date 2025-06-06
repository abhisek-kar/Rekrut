import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedType?: string;
  data?: Record<string, unknown>;
  emailSent?: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        // Job-related notifications
        "job_assignment",
        "job_status_change", 
        "job_application_received",
        "job_deadline_reminder",
        
        // Application-related notifications
        "application_status_change",
        "application_review_request",
        "application_interview_scheduled",
        "application_hired",
        "application_rejected",
        
        // System notifications
        "account_created",
        "password_reset",
        "system_maintenance",
        "bulk_operation_complete",
        
        // Candidate notifications
        "application_confirmation",
        "interview_reminder",
        "offer_extended",
        "welcome_message"
      ]
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String }, // URL to related resource
    relatedId: { type: Schema.Types.ObjectId }, // Related entity ID
    relatedType: { 
      type: String,
      enum: ["job", "application", "candidate", "user"]
    },
    data: { type: Schema.Types.Mixed }, // Additional notification data
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ relatedId: 1, relatedType: 1 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
