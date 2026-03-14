import { Document, Types } from "mongoose";
import { JobType, ProjectCategory, ProjectStatus } from "./enum.js";

export interface IBudget {
  min: number;
  max: number;
  type: JobType;
}

export interface IProject extends Document {
  title: string;
  description: string;
  budget: IBudget;
  projectLength: string;
  deadline: Date;
  skillsRequired: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  clientId: Types.ObjectId;
  freelancerId?: Types.ObjectId;
  savedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
