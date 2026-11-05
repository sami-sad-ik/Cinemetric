import { randomUUID } from "node:crypto";
import status from "http-status";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import { Prisma } from "../../../generated/prisma/schema/client";
import {
  PaymentStatus,
  Role,
  UserStatus,
} from "../../../generated/prisma/schema/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUserInterface";
import { prisma } from "../../lib/prisma";
import {
  UpdateMyProfilePayload,
  UpdateUserByAdminPayload,
} from "./user.interface";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  image: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const getMe = async (user: IRequestUser) => {
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
  });
  if (!userData) throw new AppError(status.NOT_FOUND, "User not found");
  return userData;
};

const updateMyProfile = async (
  userId: string,
  payload: UpdateMyProfilePayload,
) => {
  const data: Prisma.UserUpdateInput = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.profileImage !== undefined) data.image = payload.profileImage;

  const { image, ...userData } = await prisma.user.update({
    where: { id: userId },
    data,
    select: safeUserSelect,
  });
  return { ...userData, profileImage: image };
};

const updateUserByAdmin = async (
  actor: IRequestUser,
  userId: string,
  payload: UpdateUserByAdminPayload,
) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!targetUser) throw new AppError(status.NOT_FOUND, "User not found");
  if (
    actor.userId === userId &&
    (payload.role !== undefined || payload.status !== undefined)
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Admins cannot change their own role or status",
    );
  }

  const data: Prisma.UserUpdateInput = {};
  if (payload.role !== undefined) data.role = payload.role;
  if (payload.status !== undefined) data.status = payload.status;

  const { image, ...userData } = await prisma.user.update({
    where: { id: userId },
    data,
    select: safeUserSelect,
  });
  return { ...userData, profileImage: image };
};

const deleteUser = async (actor: IRequestUser, userId: string) => {
  if (actor.role !== Role.ADMIN && actor.role !== Role.SUPER_ADMIN) {
    throw new AppError(status.FORBIDDEN, "Only admins can manage users");
  }
  const userData = await prisma.user.findUnique({ where: { id: userId } });
  if (!userData) throw new AppError(status.NOT_FOUND, "User not found");
  if (userData.isDeleted || userData.status === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "User is already deleted");
  }
  return prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: UserStatus.DELETED,
    },
  });
};

const blockUser = async (actor: IRequestUser, userId: string) => {
  if (actor.role !== Role.ADMIN && actor.role !== Role.SUPER_ADMIN) {
    throw new AppError(status.FORBIDDEN, "Only admins can manage users");
  }
  const userData = await prisma.user.findUnique({ where: { id: userId } });
  if (!userData) throw new AppError(status.NOT_FOUND, "User not found");
  if (userData.isDeleted || userData.status === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "Deleted users cannot be blocked");
  }
  return prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.BLOCKED },
  });
};

const handleSubscription = async (user: IRequestUser) => {
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
  });
  if (!userData) {
    throw new AppError(
      status.NOT_FOUND,
      `User with ID ${user.userId} not found.`,
    );
  }
  const transactionId = randomUUID();
  const paymentData = await prisma.payment.create({
    data: {
      userId: user.userId,
      amount: 1000,
      transactionId,
    },
  });
  let session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        allowed_payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "bdt",
              product_data: { name: `Premium access for ${userData.email}` },
              unit_amount: 1000 * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userData.id,
          paymentId: paymentData.id,
        },
        success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
        cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
      },
      { idempotencyKey: transactionId },
    );
  } catch (error) {
    await prisma.payment.update({
      where: { id: paymentData.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw error;
  }

  if (!session.url) {
    await prisma.payment.update({
      where: { id: paymentData.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw new AppError(
      status.BAD_GATEWAY,
      "Stripe did not return a checkout URL.",
    );
  }

  return {
    user: userData,
    paymentData,
    paymentUrl: session.url,
  };
};

export const userService = {
  getMe,
  updateMyProfile,
  updateUserByAdmin,
  deleteUser,
  blockUser,
  handleSubscription,
};
