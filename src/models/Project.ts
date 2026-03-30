import mongoose, { Schema } from "mongoose";
import { IProject } from "../types/project.types.js";
import {
  JobType,
  ProjectCategory,
  ProjectLength,
  ProjectStatus,
} from "../types/enum.js";

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: 10,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    budget: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      type: { type: String, required: true, enum: Object.values(JobType) }, // for finding projects by job type
    },
    projectLength: {
      type: String,
      enum: Object.values(ProjectLength),
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(ProjectCategory), // for finding projects by category
      required: [true, "Category is required"],
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus), // for finding projects by status
      default: ProjectStatus.OPEN,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancerId: {
      type: Schema.Types.ObjectId, // for finding projects assigned to freelancer
      ref: "User",
    },
    savedBy: [
      {
        type: Schema.Types.ObjectId, // for finding projects saved by freelancer
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);
ProjectSchema.index({ clientId: 1 }); // for finding projects by client
ProjectSchema.index({ status: 1 }); // for finding projects by status
ProjectSchema.index({ category: 1 }); // for finding projects by category
ProjectSchema.index({ skillsRequired: 1 }); // for finding projects by skills
ProjectSchema.index({ "budget.min": 1, "budget.max": 1 }); // for finding projects by budget
ProjectSchema.index({ title: "text", description: "text" }); // for searching projects by title and description
export const Project = mongoose.model<IProject>("Project", ProjectSchema);
