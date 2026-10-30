import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ReviewStatus, Role } from "../../../generated/prisma/schema/enums";
import { CommentPayload } from "./comment.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  commentFilterableFields,
  commentSearchableFields,
} from "./comment.constraint";
import { IQueryParams } from "../../interfaces/query.interface";
import { Comment, Prisma } from "../../../generated/prisma/schema/client";

const createComment = async (
  userId: string,
  reviewId: string,
  payload: CommentPayload,
) => {
  const { body, parentCommentId } = payload;

  const reviewData = await prisma.review.findFirst({
    where: { id: reviewId, status: ReviewStatus.PUBLISHED },
  });
  if (!reviewData) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (parentCommentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      select: { reviewId: true, parentCommentId: true },
    });

    if (!parentComment || parentComment.reviewId !== reviewId) {
      throw new AppError(status.NOT_FOUND, "Parent comment not found");
    }

    if (parentComment.parentCommentId) {
      throw new AppError(
        status.BAD_REQUEST,
        "Replies to replies are not allowed",
      );
    }
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      reviewId,
      body,
      parentCommentId: parentCommentId ?? null,
    },
  });

  return comment;
};

const getCommentsByReviewId = async (reviewId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Comment,
    Prisma.CommentWhereInput,
    Prisma.CommentInclude
  >(prisma.comment, query, {
    searchableFields: commentSearchableFields,
    filterableFields: commentFilterableFields,
  });
  const result = await queryBuilder
    .search()
    .filter()
    .where({
      reviewId,
      parentCommentId: null,
    })
    .include({
      user: { select: { name: true, image: true } },
      replies: {
        include: {
          user: { select: { name: true, image: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    })
    .sort()
    .paginate()
    .execute();
  return result;
};

const updateComment = async (
  commentId: string,
  userId: string,
  body: string,
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, review: { status: ReviewStatus.PUBLISHED } },
  });
  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }
  if (comment.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to update this comment",
    );
  }
  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { body },
  });
  return updatedComment;
};

const deleteComment = async (commentId: string, userId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, review: { status: ReviewStatus.PUBLISHED } },
  });
  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  const isAdmin =
    userData?.role === Role.SUPER_ADMIN || userData?.role === Role.ADMIN;

  if (!isAdmin && comment.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to delete this comment",
    );
  }
  const result = await prisma.comment.delete({
    where: { id: commentId },
  });
  return result;
};

const getCommentCountByReviewId = async (reviewId: string) => {
  const count = await prisma.comment.count({
    where: { reviewId },
  });
  return count;
};

const getRepliesByCommentId = async (
  commentId: string,
  query: IQueryParams,
) => {
  const parentComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { review: { select: { status: true } } },
  });
  if (
    !parentComment ||
    parentComment.review.status !== ReviewStatus.PUBLISHED
  ) {
    throw new AppError(status.NOT_FOUND, "Comment not found");
  }
  const queryBuilder = new QueryBuilder<
    Comment,
    Prisma.CommentWhereInput,
    Prisma.CommentInclude
  >(prisma.comment, query, {
    searchableFields: commentSearchableFields,
    filterableFields: commentFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ parentCommentId: commentId })
    .include({
      user: { select: { name: true, image: true } },
    })
    .sort()
    .paginate()
    .execute();

  return result;
};

export const commentService = {
  createComment,
  getCommentsByReviewId,
  updateComment,
  deleteComment,
  getCommentCountByReviewId,
  getRepliesByCommentId,
};
