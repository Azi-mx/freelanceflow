import { NextFunction, Request, Response } from "express";
import * as projectService from "../services/projectService.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validations/project.validation.js";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientId = req.user!.id;
    const result = await projectService.createProject(req.body, clientId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const clientId = req.user!.id;
    const result = await projectService.updateProject(
      req.body,
      projectId,
      clientId,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const result = await projectService.getProjectById(projectId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const clientId = req.user!.id;
    const result = await projectService.deleteProject(projectId, clientId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const saveProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const freelancerId = req.user!.id;
    const result = await projectService.saveProject(freelancerId, projectId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filters: {
      category?: string;
      search?: string;
      jobType?: string;
      minBudget?: number;
      maxBudget?: number;
      skills?: string[];
    } = {};
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.jobType) filters.jobType = req.query.jobType as string;
    if (req.query.minBudget) filters.minBudget = Number(req.query.minBudget);
    if (req.query.maxBudget) filters.maxBudget = Number(req.query.maxBudget);
    if (req.query.skills)
      filters.skills = (req.query.skills as string).split(",");
    const result = await projectService.getProjects(page, limit, filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
