import mongoose from "mongoose";
import { Bid } from "../models/Bid.js";
import { Project } from "../models/Project.js";
import { BidStatus, ProjectStatus } from "../types/enum.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateBidInput,
  UpdateBidInput,
} from "../validations/bid.validation.js";
import { createContract } from "./contractService.js";

export const createBid = async (
  data: CreateBidInput,
  projectId: string,
  freelancerId: string,
) => {
  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  if (project.status !== ProjectStatus.OPEN) {
    throw new AppError("Project is not open", 400);
  }
  const existing = await Bid.findOne({ projectId, freelancerId });
  if (existing) {
    throw new AppError("Bid already exists", 400);
  }
  const bid = await Bid.create({
    ...data,
    projectId,
    freelancerId,
    clientId: project.clientId,
  });
  return {
    id: bid._id,
    projectId: bid.projectId,
    bidAmount: bid.bidAmount,
    timeline: bid.timeline,
    status: bid.status,
    coverLetter: bid.coverLetter,
    createdAt: bid.createdAt,
  };
};

export const updateBid = async (
  data: UpdateBidInput,
  bidId: string,
  freelancerId: string,
) => {
  const bid = await Bid.findOneAndUpdate(
    {
      _id: bidId,
      freelancerId: freelancerId,
      status: BidStatus.PENDING,
    },
    data,
    { new: true },
  );
  if (!bid) throw new AppError("Bid not found", 404);
  return bid;
};

export const acceptBid = async (bidId: string, clientId: string) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const bid = await Bid.findOneAndUpdate(
        { _id: bidId, clientId, status: BidStatus.PENDING },
        { status: BidStatus.ACCEPTED },
        { new: true, session },
      );
      if (!bid) throw new AppError("Bid not found", 404);

      await Promise.all([
        Bid.updateMany(
          { projectId: bid.projectId, _id: { $ne: bidId } },
          { status: BidStatus.REJECTED },
          { session },
        ),
        Project.updateOne(
          { _id: bid.projectId },
          { status: ProjectStatus.IN_PROGRESS, freelancerId: bid.freelancerId },
          { session },
        ),
        createContract(bid, session),
      ]);
      const projectUpdate = await Project.updateOne(
        { _id: bid.projectId, status: ProjectStatus.OPEN },
        { status: ProjectStatus.IN_PROGRESS, freelancerId: bid.freelancerId },
        { session },
      );
      if (projectUpdate.modifiedCount === 0) {
        throw new AppError("Project is no longer open", 400);
      }
      return { message: "Bid accepted successfully" };
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};
export const rejectBid = async (bidId: string, clientId: string) => {
  const bid = await Bid.findOne({ _id: bidId, clientId });
  if (!bid) throw new AppError("Bid not found", 404);
  if (bid.status !== BidStatus.PENDING)
    throw new AppError("Bid is not pending", 400);
  await Bid.findOneAndUpdate(
    { _id: bidId, clientId },
    { status: BidStatus.REJECTED },
  );
  return { message: "Bid rejected successfully" };
};

export const withdrawBid = async (bidId: string, freelancerId: string) => {
  const bid = await Bid.findOneAndUpdate(
    { _id: bidId, freelancerId, status: BidStatus.PENDING },
    { status: BidStatus.WITHDRAWN },
    { new: true },
  );
  if (!bid) throw new AppError("Bid not found", 404);
  return { message: "Bid withdrawn successfully" };
};
export const getBidsByFreelancer = async (freelancerId: string) => {
  const bids = await Bid.find({ freelancerId })
    .populate("projectId", "title budget status category")
    .lean();
  return bids;
};

export const getBidsByProject = async (projectId: string, clientId: string) => {
  const project = await Project.findOne({ _id: projectId, clientId }).lean();
  if (!project) throw new AppError("Project not found", 404);
  const bids = await Bid.find({ projectId })
    .populate("freelancerId", "name avatar hourlyRate skills bio")
    .lean();
  return bids;
};
