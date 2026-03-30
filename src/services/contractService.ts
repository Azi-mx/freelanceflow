import mongoose from "mongoose";
import { Contract } from "../models/Contract.js";
import { IBid } from "../types/bid.types.js";
import { ContractStatus } from "../types/enum.js";
import { AppError } from "../utils/AppError.js";
import { Project } from "../models/Project.js";

export const createContract = async (
  bid: IBid,
  session: mongoose.ClientSession,
) => {
  const project = await Project.findById(bid.projectId).session(session).lean();
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // Warn if freelancer timeline exceeds project deadline
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + bid.timeline);
  if (endDate > project.deadline) {
    console.warn(
      `Contract endDate exceeds project deadline for project ${bid.projectId}`,
    );
  }
  const contract = await Contract.create(
    [
      {
        projectId: bid.projectId,
        freelancerId: bid.freelancerId,
        bidId: bid._id,
        clientId: bid.clientId,
        totalAmount: bid.bidAmount,
        durationDays: bid.timeline,
        terms: project.description,
        startDate: new Date(),
        endDate,
        status: ContractStatus.ACTIVE,
      },
    ],
    { session },
  );
  return contract;
};
export const getContract = async (contractId: string) => {
  const contract = await Contract.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(contractId) } },
    {
      $lookup: {
        from: "users",
        localField: "clientId",
        foreignField: "_id",
        as: "client",
        pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "freelancerId",
        foreignField: "_id",
        as: "freelancer",
        pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "projectId",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $project: {
              title: 1,
              budget: 1,
              category: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$client" },
    { $unwind: "$freelancer" },
    { $unwind: "$project" },
  ]);

  if (!contract.length) {
    throw new AppError("Contract not found", 404);
  }
  return contract[0];
};
export const getClientContracts = async (clientId: string) => {
  const contracts = await Contract.find({ clientId })
    .populate("freelancerId", "name email avatar")
    .populate("projectId", "title budget category")
    .lean();
  return contracts;
};
export const getFreelancerContracts = async (freelancerId: string) => {
  const contracts = await Contract.find({ freelancerId })
    .populate("clientId", "name email avatar")
    .populate("projectId", "title budget category")
    .lean();
  return contracts;
};
export const terminateContract = async (contractId: string, userId: string) => {
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError("Contract not found", 404);
  }
  if (contract.status === ContractStatus.ACTIVE) {
    if (contract.clientId.toString() === userId) {
      contract.status = ContractStatus.TERMINATED_BY_CLIENT;
    } else if (contract.freelancerId.toString() === userId) {
      contract.status = ContractStatus.TERMINATED_BY_FREELANCER;
    } else {
      throw new AppError(
        "User is not authorized to terminate this contract",
        403,
      );
    }
    contract.endDate = new Date();
    await contract.save();
    return { message: "Contract terminated successfully" };
  }
  throw new AppError("Contract is not active", 400);
};
export const completeContract = async (
  contractId: string,
  clientId: string,
) => {
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError("Contract not found", 404);
  }
  if (contract.clientId.toString() !== clientId) {
    throw new AppError("User is not authorized to complete this contract", 403);
  }
  if (contract.status !== ContractStatus.ACTIVE) {
    throw new AppError("Contract is not active", 400);
  }

  contract.status = ContractStatus.COMPLETED;
  contract.endDate = new Date();
  await contract.save();
  return { message: "Contract Completed successfully" };
};
