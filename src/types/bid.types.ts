import { BidStatus } from "./enum.js";
import { Document, Types } from "mongoose";

export interface IBid extends Document {
  projectId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  clientId: Types.ObjectId;
  coverLetter: string;
  bidAmount: number;
  timeline: number;
  status: BidStatus;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}
