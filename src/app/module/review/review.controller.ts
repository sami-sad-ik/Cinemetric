import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

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

const getPublishedReviewsByContent = catchAsync(
  async (req: Request, res: Response) => {
    const contentId = req.params.id;
    const result = await reviewService.getPublishedReviewsByContent(
      contentId as string,
    );
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reviews fetched successfully",
      data: result,
    });
  },
);

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await reviewService.getMyReviews(userId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User's reviews fetched successfully",
    data: result,
  });
});

const updateMyReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user.userId;
  const payload = req.body;
  const result = await reviewService.updateMyReview(
    reviewId as string,
    userId,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteMyReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const userId = req.user.userId;
  const result = await reviewService.deleteMyReview(reviewId as string, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

//admin
const getPendingReviews = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await reviewService.getPendingReviews(query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const approveReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const result = await reviewService.approveReview(reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review approved successfully",
    data: result,
  });
});

const rejectReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const result = await reviewService.rejectReview(reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review rejected successfully",
    data: result,
  });
});

const unpublishReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const result = await reviewService.unpublishReview(reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review unpublished successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const result = await reviewService.deleteReview(reviewId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getPublishedReviewsByContent,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getPendingReviews,
  approveReview,
  rejectReview,
  unpublishReview,
  deleteReview,
};
