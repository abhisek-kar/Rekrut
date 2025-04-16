import mongoose, { Schema, Document, Model } from 'mongoose';

// Notification model will be implemented later
// This is a placeholder file to complete the structure

const NotificationSchema = new Schema({}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
