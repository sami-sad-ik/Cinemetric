import z from "zod";

export const createContentZodSchema = z.object({
  title: z.string().max(100),
  type: z.enum(["movie", "series"], `type must be either 'movie' or 'series'`),
  genre: z.array(
    z.enum([
      "action",
      "comedy",
      "drama",
      "fantasy",
      "horror",
      "mystery",
      "romance",
      "thriller",
      "family",
    ]),
  ),
  releaseYear: z
    .number()
    .int()
    .nonnegative()
    .max(new Date().getFullYear(), `releaseYear cannot be in the future`),
  synopsis: z.string().max(500),
  director: z
    .string()
    .max(
      100,
      "director must be a string with a maximum length of 100 characters",
    ),
  streamingPlatform: z.array(
    z.enum(["netflix", "disneyPlus", "amazonPrime", "appleTvPlus"]),
  ),
  priceTier: z
    .enum(["FREE", "PREMIUM"], `Pricetier must be either 'FREE' or 'PREMIUM' `)
    .default("FREE"),
  cast: z.array(z.string().max(100)),
  youtubeVideoId: z.string().max(20).optional(),
});
