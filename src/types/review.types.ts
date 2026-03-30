import { Document, Types } from "mongoose";
import { UserRole } from "./enum.js";

export interface IReview extends Document {
  contractId: Types.ObjectId;
  projectId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;
  rating: number;
  comment: string;
  reviewerRole: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
