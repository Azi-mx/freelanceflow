import { NextFunction, Request, Response } from "express";
import * as profileService from "../services/profileService.js";
import {
  updateClientSchema,
  updateFreelancerSchema,
} from "../validations/profile.validation.js";
export const updateFreelancerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await profileService.updateFreelancerProfile(
      req.user!.id,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateClientProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await profileService.updateClientProfile(
      req.user!.id,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await profileService.getUserProfile(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
