import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { likeService } from "./like.service";

const toggleLike = catchAsync(async (req, res) => {
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

const getLikeCountByReviewId = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const result = await likeService.getLikeCountByReviewId(reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Like count retrieved successfully",
    data: result,
  });
});

export const likeController = {
  toggleLike,
  getLikeCountByReviewId,
};
