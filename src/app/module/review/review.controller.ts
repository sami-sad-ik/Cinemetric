import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user.userId;
  const result = await reviewService.createReview(payload, userId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
};
