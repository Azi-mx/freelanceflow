import z from "zod";

export const updateFreelancerSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().min(0).optional(),
  availability: z.boolean().optional(),
  portfolio: z.array(z.string().url()).optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  companyName: z.string().optional(),
  website: z.string().url().optional(),
});

export type UpdateFreelancerInput = z.infer<typeof updateFreelancerSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
