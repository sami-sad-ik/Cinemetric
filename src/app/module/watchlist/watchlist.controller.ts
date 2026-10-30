import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { watchlistService } from "./watchlist.service";
import { IQueryParams } from "../../interfaces/query.interface";

const addToWatchlist = catchAsync(async (req: Request, res: Response) => {
  const contentId = req.params.contentId;
  const userId = req.user.userId as string;
  const result = await watchlistService.addToWatchlist(
    contentId as string,
    userId,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content added to watchlist successfully",
    data: result,
  });
});

const removeFromWatchlist = catchAsync(async (req: Request, res: Response) => {
  const contentId = req.params.contentId;
  const userId = req.user.userId as string;
  const result = await watchlistService.removeFromWatchlist(
    contentId as string,
    userId,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content removed from watchlist successfully",
    data: result,
  });
});

const getMyWatchlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId as string;
  const query = req.query;
  const result = await watchlistService.getMyWatchlist(
    userId,
    query as IQueryParams,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Watchlist fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const watchlistController = {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
};
