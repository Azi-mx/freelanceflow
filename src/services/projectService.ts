import { PROJECT_LENGTH_THRESHOLD } from "../config/constants.js";
import { Project } from "../models/Project.js";
import { AppError } from "../utils/AppError.js";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validations/project.validation.js";

export const createProject = async (
  data: CreateProjectInput,
  clientId: string,
) => {
  const days = Math.ceil(
    (new Date(data.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (days <= 0) throw new AppError("Deadline must be in the future", 400);
  const projectLength = PROJECT_LENGTH_THRESHOLD.find(
    (threshold) => days <= threshold.max,
  );
  const project = await Project.create({
    ...data,
    clientId,
    projectLength: projectLength?.value as string,
  });
  return project;
};
export const updateProject = async (
  data: UpdateProjectInput,
  projectId: string,
  clientId: string,
) => {
  const project = await Project.findOneAndUpdate(
    {
      _id: projectId,
      clientId: clientId,
    },
    data,
    { new: true },
  );
  if (!project) throw new AppError("Project not found", 404);
  return project;
};
export const deleteProject = async (id: string, clientId: string) => {
  const project = await Project.findOneAndDelete({ _id: id, clientId });
  if (!project) throw new AppError("Project not found", 404);
  return { message: "Project deleted successfully" };
};
export const getProjectById = async (projectId: string) => {
  const project = await Project.findById(projectId)
    .populate("clientId", "name email avatar companyName")
    .lean();
  if (!project) throw new AppError("Project not found", 404);
  return project;
};
export const saveProject = async (freelancerId: string, projectId: string) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { savedBy: freelancerId } },
    { new: true },
  );
  if (!project) throw new AppError("Project not found", 404);
  return { message: "Project saved successfully" };
};

export const getProjects = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    category?: string;
    maxBudget?: number;
    minBudget?: number;
    skills?: string[];
    jobType?: string;
    search?: string;
  } = {},
) => {
  const query: Record<string, unknown> = { status: "open" };
  if (filters.category) {
    query["category"] = filters.category;
  }
  if (filters.jobType) query["budget.type"] = filters.jobType;
  if (filters.skills?.length) query["skillsRequired"] = { $in: filters.skills };
  if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
    query["budget.min"] = { $gte: filters.minBudget ?? 0 };
    if (filters.maxBudget !== undefined) {
      query["budget.max"] = { $lte: filters.maxBudget };
    }
  }
  if (filters.search) {
    query["$text"] = { $search: filters.search };
  }
  const skip = (page - 1) * limit;
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate("clientId", "name email avatar companyName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);
  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
