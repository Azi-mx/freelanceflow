import { Bid } from "../models/Bid.js";
import { Project } from "../models/Project.js";
import { BidStatus, ProjectStatus } from "../types/enum.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateBidInput,
  UpdateBidInput,
} from "../validations/bid.validation.js";

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
  return bid;
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
    },
    data,
    { new: true },
  );
  if (!bid) throw new AppError("Bid not found", 404);
  return bid;
};

export const acceptBid = async (bidId: string, clientId: string) => {
  const bid = await Bid.findOne({
    _id: bidId,
    clientId,
  });
  if (!bid) throw new AppError("Bid not found", 404);
  if (bid.status !== BidStatus.PENDING) {
    throw new AppError("Bid is not pending", 400);
  }

  await Promise.all([
    Bid.updateOne({ _id: bidId }, { status: BidStatus.ACCEPTED }),
    Bid.updateMany(
      { projectId: bid.projectId, _id: { $ne: bidId } },
      { status: BidStatus.REJECTED },
    ),
    Project.updateOne(
      { _id: bid.projectId },
      { status: ProjectStatus.IN_PROGRESS, freelancerId: bid.freelancerId },
    ),
  ]);
  return { message: "Bid accepted successfully" };
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
    .populate("projectId", " title budget status category")
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
