import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload } from "./review.interface";
import { ReviewStatus } from "../../../generated/prisma/schema/enums";

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

export const reviewService = {
  createReview,
};
