import mongoose, { Schema } from "mongoose";
import { UserRole } from "../types/enum.js";
import { IReview } from "../types/review.types.js";

const ReviewSchema = new Schema<IReview>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    reviewerRole: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ReviewSchema.index({ contractId: 1, reviewerId: 1 }, { unique: true });
ReviewSchema.index({ revieweeId: 1 });
ReviewSchema.index({ projectId: 1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
