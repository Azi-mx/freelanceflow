import { z } from "zod";
import { JobType, ProjectCategory } from "../types/enum.js";

export const createProjectSchema = z.object({
  title: z.string().max(100).min(10),
  description: z.string().max(5000).min(10),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    type: z.enum(Object.values(JobType) as [string, ...string[]]),
  }),
  projectLength: z.enum([
    "less_than_1_month",
    "1_to_3_months",
    "3_to_6_months",
    "6_to_12_months",
    "more_than_12_months",
  ]),
  deadline: z.coerce.date(),
  skillsRequired: z.array(z.string()).min(1),
  category: z.enum(Object.values(ProjectCategory) as [string, ...string[]]),
});
export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
