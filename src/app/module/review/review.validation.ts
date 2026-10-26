import z from "zod";

export const createReviewZodSchema = z.object({
  contentId: z.string().min(1, "Content id is required"),
  rating: z.number().min(1).max(10),
  body: z.string().trim().min(10, "Review is too short").max(2000),
  tags: z
    .array(z.string().trim().toLowerCase())
    .min(1, "Tags are required")
    .max(5, "Tags must be less than 5"),
  spoiler: z.boolean().optional(),
});
