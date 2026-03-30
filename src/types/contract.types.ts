import { Document, Types } from "mongoose";
import { ContractStatus } from "./enum";

export interface IContract extends Document {
  projectId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  bidId: Types.ObjectId;
  clientId: Types.ObjectId;
  totalAmount: number;
  durationDays: number;
  terms: string;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
}
