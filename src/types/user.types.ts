import { Document } from "mongoose";
import { UserRole } from "./enum.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  refreshToken?: string;
  //Freelancer Specific
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  portfolio?: string[];
  availability?: boolean;
  //Client Specific
  companyName?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
