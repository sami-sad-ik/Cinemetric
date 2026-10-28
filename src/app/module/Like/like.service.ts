import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ReviewStatus } from "../../../generated/prisma/schema/enums";

const toggleLike = async (userId: string, reviewId: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const reviewData = await prisma.review.findUnique({
    where: { id: reviewId, status: ReviewStatus.PUBLISHED },
    select: { id: true, userId: true },
  });
  if (!reviewData) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  const existingLike = await prisma.like.findUnique({
    where: { reviewId_userId: { reviewId, userId } },
  });
  if (reviewData.userId === userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot like your own review");
  }
  if (existingLike) {
    await prisma.like.delete({
      where: { reviewId_userId: { reviewId, userId } },
    });
    return { liked: false, message: "Like removed successfully" };
  }
  await prisma.like.create({
    data: {
      reviewId,
      userId,
    },
  });
  return { liked: true, message: "Like added successfully" };
};

const getLikeCountByReviewId = async (reviewId: string) => {
  return prisma.like.count({
    where: { reviewId },
  });
};

export const likeService = {
  toggleLike,
  getLikeCountByReviewId,
};
