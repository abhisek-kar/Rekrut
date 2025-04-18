import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string; // 'create', 'update', 'delete', 'login', 'logout', 'status_change', etc.
  entityType: string; // 'job', 'candidate', 'application', 'user', etc.
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Create indexes for common queries
ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ action: 1 });
ActivitySchema.index({ entityType: 1 });
ActivitySchema.index({ entityId: 1 });
ActivitySchema.index({ createdAt: -1 });

// Use function to avoid issues with model compilation in Next.js hot reloading
export default (mongoose.models.Activity as Model<IActivity>) || 
  mongoose.model<IActivity>('Activity', ActivitySchema);
