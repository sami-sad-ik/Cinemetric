import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { likeService } from "./like.service";
import { Request, Response } from "express";

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const reviewId = req.params.id;
  const result = await likeService.toggleLike(userId, reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Like toggled successfully",
    data: result,
  });
});

const getLikeCountByReviewId = catchAsync(
  async (req: Request, res: Response) => {
    const reviewId = req.params.id;
    const result = await likeService.getLikeCountByReviewId(reviewId as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Like count retrieved successfully",
      data: result,
    });
  },
);

const hasUserLiked = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const reviewId = req.params.id;
  const result = await likeService.hasUserLiked(userId, reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User like status retrieved successfully",
    data: result,
  });
});

export const likeController = {
  toggleLike,
  getLikeCountByReviewId,
  hasUserLiked,
};
