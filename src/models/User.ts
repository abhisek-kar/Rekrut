import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "admin" | "subadmin";
  profilePhoto?: string;
  status: "active" | "inactive";
  permissions?: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  setupToken?: string;
  setupTokenExpires?: Date;
  lastLogin?: Date;
  lastLogout?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["admin", "subadmin"], default: "subadmin" },
    profilePhoto: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    permissions: [{ type: String }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    setupToken: { type: String },
    setupTokenExpires: { type: Date },
    lastLogin: { type: Date },
    lastLogout: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes for common queries
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ setupToken: 1 });

const User = mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);
export default User;
