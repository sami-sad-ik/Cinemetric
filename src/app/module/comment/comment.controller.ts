import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { commentService } from "./comment.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId as string;
  const userId = req.user.userId;
  const payload = req.body;

  const result = await commentService.createComment(userId, reviewId, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getCommentsByReviewId = catchAsync(
  async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId as string;
    const query = req.query;
    const result = await commentService.getCommentsByReviewId(
      reviewId,
      query as IQueryParams,
    );
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const userId = req.user.userId;
  const { body } = req.body;
  const result = await commentService.updateComment(commentId, userId, body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const userId = req.user.userId;
  const result = await commentService.deleteComment(commentId, userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

const getCommentCountByReviewId = catchAsync(
  async (req: Request, res: Response) => {
    const reviewId = req.params.reviewId as string;
    const count = await commentService.getCommentCountByReviewId(reviewId);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comment count retrieved successfully",
      data: { count },
    });
  },
);

const getRepliesByCommentId = catchAsync(
  async (req: Request, res: Response) => {
    const commentId = req.params.commentId as string;
    const query = req.query;
    const result = await commentService.getRepliesByCommentId(
      commentId,
      query as IQueryParams,
    );
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Replies retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const commentController = {
  createComment,
  getCommentsByReviewId,
  updateComment,
  deleteComment,
  getCommentCountByReviewId,
  getRepliesByCommentId,
};
