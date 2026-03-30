import mongoose, { Schema } from "mongoose";
import { IBid } from "../types/bid.types.js";
import { BidStatus } from "../types/enum.js";

const BidSchema = new Schema<IBid>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    freelancerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Freelancer is required"],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
    },
    coverLetter: {
      type: String,
      required: [true, "Cover letter is required"],
    },
    bidAmount: {
      type: Number,
      required: [true, "Bid amount is required"],
    },
    status: {
      type: String,
      enum: Object.values(BidStatus),
      default: BidStatus.PENDING,
    },
    timeline: {
      type: Number,
      required: [true, "Timeline is required"],
      min: 1,
      max: 365,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
BidSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });
BidSchema.index({ projectId: 1 }); // get all bids for a project
BidSchema.index({ freelancerId: 1 }); // get all bids by a freelancer
BidSchema.index({ clientId: 1 }); // get all bids on client's projects
BidSchema.index({ status: 1 }); // filter by status
export const Bid = mongoose.model<IBid>("Bid", BidSchema);
