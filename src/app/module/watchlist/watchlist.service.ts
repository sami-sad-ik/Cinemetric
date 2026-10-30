import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { Prisma, Watchlist } from "../../../generated/prisma/schema/client";
import {
  watchlistFilterableFields,
  watchlistSearchableFields,
} from "./watchlist.constraint";

const addToWatchlist = async (contentId: string, userId: string) => {
  const contentData = await prisma.content.findUnique({
    where: { id: contentId },
  });
  if (!contentData) {
    throw new AppError(status.NOT_FOUND, "Content not found");
  }
  const result = await prisma.watchlist.create({
    data: {
      contentId,
      userId,
    },
  });
  return result;
};

const removeFromWatchlist = async (contentId: string, userId: string) => {
  const contentData = await prisma.content.findUnique({
    where: { id: contentId },
  });
  if (!contentData) {
    throw new AppError(status.NOT_FOUND, "Content not found");
  }
  const watchlistEntry = await prisma.watchlist.findUnique({
    where: { unique_user_content: { contentId, userId } },
  });
  if (!watchlistEntry) {
    throw new AppError(status.NOT_FOUND, "Content not found in watchlist");
  }
  const result = await prisma.watchlist.delete({
    where: { unique_user_content: { contentId, userId } },
  });
  return result;
};

const getMyWatchlist = async (userId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Watchlist,
    Prisma.WatchlistWhereInput,
    Prisma.WatchlistInclude
  >(prisma.watchlist, query, {
    searchableFields: watchlistSearchableFields,
    filterableFields: watchlistFilterableFields,
  });

  const result = await queryBuilder
    .where({ userId })
    .search()
    .filter()
    .paginate()
    .sort()
    .include({ content: true })
    .execute();
  return result;
};

const isInWatchlist = async (contentId: string, userId: string) => {
  const listed = await prisma.watchlist.findUnique({
    where: { unique_user_content: { contentId, userId } },
  });
  return { isInWatchlist: !!listed };
};

export const watchlistService = {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  isInWatchlist,
};
