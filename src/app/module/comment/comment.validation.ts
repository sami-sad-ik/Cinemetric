import z from "zod";

export const createCommentZodSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(2000),
  parentCommentId: z.string().min(1).optional(),
});