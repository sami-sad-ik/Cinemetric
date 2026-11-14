import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/schema/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUserInterface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUser) => {
  let statsData;
  switch (user.role) {
    case Role.SUPER_ADMIN:
      statsData = await getSuperAdminStatsData();
      break;
    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case Role.USER:
      statsData = await getUserStatsData(user);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }
  return statsData;
};

const getSuperAdminStatsData = async () => {
  const userCount = await prisma.user.count();
  const contentCount = await prisma.content.count();
  const reviewCount = await prisma.review.count();
  const likeCount = await prisma.like.count();
  const commentCount = await prisma.comment.count();
  const superAdminCount = await prisma.user.count({
    where: {
      role: Role.SUPER_ADMIN,
    },
  });
  const adminCount = await prisma.user.count({
    where: {
      role: Role.ADMIN,
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: { status: PaymentStatus.PAID },
  });
  return {
    userCount,
    contentCount,
    reviewCount,
    likeCount,
    commentCount,
    superAdminCount,
    adminCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getAdminStatsData = async () => {
  const userCount = await prisma.user.count();
  const contentCount = await prisma.content.count();
  const reviewCount = await prisma.review.count();
  const likeCount = await prisma.like.count();
  const commentCount = await prisma.comment.count();
  const adminCount = await prisma.user.count({
    where: {
      role: Role.ADMIN,
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: { status: PaymentStatus.PAID },
  });
  return {
    userCount,
    contentCount,
    reviewCount,
    likeCount,
    commentCount,
    adminCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getUserStatsData = async (user: IRequestUser) => {
  const patientData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });
  if (!patientData) throw new AppError(status.NOT_FOUND, "User not found");
  const reviewCount = await prisma.review.count({
    where: {
      userId: patientData.id,
    },
  });
  const likeCount = await prisma.like.count({
    where: {
      userId: patientData.id,
    },
  });
  const commentCount = await prisma.comment.count({
    where: {
      userId: patientData.id,
    },
  });
  const paymentCount = await prisma.payment.count({
    where: {
      userId: patientData.id,
      status: PaymentStatus.PAID,
    },
  });
  return {
    reviewCount,
    likeCount,
    commentCount,
    paymentCount,
  };
};

export const statsService = {
  getDashboardStatsData,
};
