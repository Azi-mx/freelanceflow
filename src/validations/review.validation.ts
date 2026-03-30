import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
