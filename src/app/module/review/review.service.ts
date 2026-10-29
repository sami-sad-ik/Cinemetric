import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload, UpdateReviewPayload } from "./review.interface";
import { ReviewStatus } from "../../../generated/prisma/schema/enums";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import {
  reviewFilterableFields,
  reviewSearchableFields,
} from "./review.constraint";
import { Prisma, Review } from "../../../generated/prisma/schema/client";

const createReview = async (payload: CreateReviewPayload, userId: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const contentData = await prisma.content.findUnique({
    where: { id: payload.contentId },
  });

  if (!contentData) {
    throw new AppError(status.NOT_FOUND, "Content not found");
  }

  const reviewData = await prisma.review.create({
    data: {
      ...payload,
      userId: userData.id,
      status: ReviewStatus.PENDING,
    },
  });

  return reviewData;
};

const getPublishedReviewsByContent = async (contentId: string) => {
  const reviewData = await prisma.review.findMany({
    where: { contentId: contentId, status: ReviewStatus.PUBLISHED },
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  return reviewData;
};

const getMyReviews = async (userId: string) => {
  const reviewData = await prisma.review.findMany({
    where: { userId },
  });
  return reviewData;
};

const updateMyReview = async (
  reviewId: string,
  userId: string,
  payload: UpdateReviewPayload,
) => {
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!reviewData) throw new AppError(status.NOT_FOUND, "Review not found");
  if (reviewData.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You can't update other's review");
  }
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { ...payload, status: ReviewStatus.PENDING },
  });
  return updatedReview;
};

const deleteMyReview = async (reviewId: string, userId: string) => {
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!reviewData) throw new AppError(status.NOT_FOUND, "Review not found");
  if (reviewData.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not the owner of this review",
    );
  }
  const result = await prisma.review.delete({
    where: { id: reviewId },
  });
  return result;
};

// Admin
const getPendingReviews = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewInclude
  >(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });
  const reviewData = queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .fields()
    .include({ user: true })
    .where({ status: ReviewStatus.PENDING })
    .execute();
  return reviewData;
};

const approveReview = async (reviewId: string) => {
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!reviewData) throw new AppError(status.NOT_FOUND, "Review not found");
  if (reviewData.status !== ReviewStatus.PENDING)
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending review can be approved",
    );

  const approvedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { status: ReviewStatus.PUBLISHED },
  });
  return approvedReview;
};

const rejectReview = async (reviewId: string) => {
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!reviewData) throw new AppError(status.NOT_FOUND, "Review not found");
  if (reviewData.status !== ReviewStatus.PENDING)
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending review can be rejected",
    );
  const rejectedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { status: ReviewStatus.REJECTED },
  });
  return rejectedReview;
};

const unpublishReview = async (reviewId: string) => {
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!reviewData) throw new AppError(status.NOT_FOUND, "Review not found");
  if (reviewData.status !== ReviewStatus.PUBLISHED)
    throw new AppError(
      status.BAD_REQUEST,
      "Only published review can be unpublished",
    );
  const unpublishedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { status: ReviewStatus.PENDING },
  });
  return unpublishedReview;
};
const deleteReview = async (reviewId: string) => {
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!reviewData) throw new AppError(status.NOT_FOUND, "Review not found");
  const result = await prisma.review.delete({
    where: { id: reviewId },
  });
  return result;
};

export const reviewService = {
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
