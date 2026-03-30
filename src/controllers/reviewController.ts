import { NextFunction, Request, Response } from "express";
import * as ReviewService from "../services/reviewService.js";
import { createReviewSchema } from "../validations/review.validation.js";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviewerId = req.user!.id;
    const contractId = req.params.contractId;
    const reviewerRole = req.user!.role;

    const validatedData = createReviewSchema.parse(req.body);

    const result = await ReviewService.createReview(
      reviewerId,
      contractId as string,
      validatedData,
      reviewerRole,
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByFreelancer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const freelancerId = req.params.freelancerId;

    const result = await ReviewService.getReviewsByFreelancer(
      freelancerId as string,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.projectId;

    const result = await ReviewService.getReviewsByProject(projectId as string);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.params.clientId;

    const result = await ReviewService.getReviewsByClient(clientId as string);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
