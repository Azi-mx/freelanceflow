// User model — single collection for both clients and freelancers
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types/user.types.js";
import { UserRole } from "../types/enum.js";
import bcrypt from "bcryptjs";
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      select: false,
      minLength: 8,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is Required"],
    },
    avatar: String,
    location: String,
    savedJobs: {
      type: [String],
    },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    bio: { type: String, maxLength: 500 },
    skills: [{ type: String }],
    hourlyRate: { type: Number, min: 0 },
    portfolio: [{ type: String }],
    availability: { type: Boolean, default: true },
    companyName: { type: String },
    website: { type: String },
  },
  { timestamps: true },
);
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods["comparePassword"] = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const User = mongoose.model<IUser>("User", UserSchema);
