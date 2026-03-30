import { Types } from "mongoose";
import { Review } from "../models/Review.js";
import { Contract } from "../models/Contract.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { ContractStatus, UserRole } from "../types/enum.js";
import { CreateReviewInput } from "../validations/review.validation.js";

export const createReview = async (
  reviewerId: string,
  contractId: string,
  data: CreateReviewInput,
  reviewerRole: UserRole,
) => {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new AppError("Contract not found", 404);
  }

  if (contract.status !== ContractStatus.COMPLETED) {
    throw new AppError("Only completed contracts can be reviewed", 400);
  }

  const reviewerObjectId = new Types.ObjectId(reviewerId);
  const isFreelancer = contract.freelancerId.equals(reviewerObjectId);
  const isClient = contract.clientId.equals(reviewerObjectId);

  if (!isFreelancer && !isClient) {
    throw new AppError("You are not part of this contract", 403);
  }

  const revieweeId =
    reviewerRole === UserRole.CLIENT
      ? contract.freelancerId
      : contract.clientId;

  const existingReview = await Review.findOne({
    contractId: contract._id,
    reviewerId: reviewerObjectId,
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this contract", 400);
  }

  const review = await Review.create({
    contractId: contract._id,
    projectId: contract.projectId,
    reviewerId: reviewerObjectId,
    revieweeId,
    rating: data.rating,
    comment: data.comment,
    reviewerRole,
  });

  const reviews = await Review.find({ revieweeId });
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviews.length;

  await User.findByIdAndUpdate(revieweeId, {
    avgRating,
    reviewCount: reviews.length,
  });

  return review;
};

export const getReviewsByFreelancer = async (freelancerId: string) => {
  const reviews = await Review.find({ revieweeId: freelancerId })
    .populate("reviewerId", "name avatar")
    .lean();

  return reviews;
};

export const getReviewsByProject = async (projectId: string) => {
  const reviews = await Review.find({ projectId })
    .populate("reviewerId", "name avatar")
    .lean();

  return reviews;
};

export const getReviewsByClient = async (clientId: string) => {
  const reviews = await Review.find({ revieweeId: clientId })
    .populate("reviewerId", "name avatar")
    .lean();

  return reviews;
};
