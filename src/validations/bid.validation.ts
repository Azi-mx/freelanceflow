import { z } from "zod";

export const createBidSchema = z.object({
  coverLetter: z.string().min(50).max(5000),
  bidAmount: z
    .number()
    .min(1, { message: "Bid amount must be greater than 0" }),
  timeline: z.string().min(1),
  attachments: z.array(z.url()).default([]),
});
export const updateBidSchema = createBidSchema.partial();

export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidInput = z.infer<typeof updateBidSchema>;
