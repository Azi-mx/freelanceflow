import mongoose, { Schema } from "mongoose";
import { ContractStatus } from "../types/enum";
import { IContract } from "../types/contract.types";

const ContractSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    terms: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [...Object.values(ContractStatus)],
      default: ContractStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  },
);

ContractSchema.index({ projectId: 1 });
ContractSchema.index({ clientId: 1 });
ContractSchema.index({ freelancerId: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ bidId: 1 }, { unique: true }); // one contract per bid
export const Contract = mongoose.model<IContract>("Contract", ContractSchema);
