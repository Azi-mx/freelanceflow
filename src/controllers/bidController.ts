import { NextFunction, Request, Response } from "express";
import {
  createBidSchema,
  updateBidSchema,
} from "../validations/bid.validation.js";
import * as bidService from "../services/bidService.js";

export const createBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const freelancerId = req.user!.id;
    const projectId = req.params.projectId as string;
    const result = await bidService.createBid(
      req.body,
      projectId,
      freelancerId,
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = updateBidSchema.parse(req.body);
    const freelancerId = req.user!.id;
    const bidId = req.params.bidId as string;
    const result = await bidService.updateBid(data, bidId, freelancerId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getBidsByFreelancer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const freelancerId = req.user!.id;
    const result = await bidService.getBidsByFreelancer(freelancerId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getBidsByProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.user!.id;
    const projectId = req.params.projectId as string;
    const result = await bidService.getBidsByProject(projectId, clientId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.user!.id;
    const bidId = req.params.bidId as string;
    const result = await bidService.acceptBid(bidId, clientId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const rejectBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.user!.id;
    const bidId = req.params.bidId as string;
    const result = await bidService.rejectBid(bidId, clientId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const withdrawBid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const freelancerId = req.user!.id;
    const bidId = req.params.bidId as string;
    const result = await bidService.withdrawBid(bidId, freelancerId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
