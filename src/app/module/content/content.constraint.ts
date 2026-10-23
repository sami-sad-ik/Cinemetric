import { Prisma } from "../../../generated/prisma/schema/client";

export const contentSearchableFields = [
  "title",
  "synopsis",
  "director",
  "cast",
  "genre",
  "streamingPlatform",
  "priceTier",
  "type",
  "releaseYear",
  "youtubeVideoId",
  "thumbnailLink",
];

export const contentFilterableFields = [
  "title",
  "synopsis",
  "director",
  "cast",
  "genre",
  "streamingPlatform",
  "priceTier",
  "type",
  "releaseYear",
  "watchlist.userId",
];

export const contentIncludeConfig: Partial<
  Record<
    keyof Prisma.ContentInclude,
    Prisma.ContentInclude[keyof Prisma.ContentInclude]
  >
> = {
  reviews: {
    include: {
      user: true,
    },
  },
  watchlists: {
    include: {
      user: true,
    },
  },
};
