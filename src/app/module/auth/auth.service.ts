import status from "http-status";
import { UserStatus } from "../../../generated/prisma/schema/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUserInterface";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRegisterUserPayload,
} from "./auth.interface";

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "User registration failed");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });

  return { ...data, accessToken, refreshToken };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });

  return { ...data, accessToken, refreshToken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
const getNewAccessToken = async (
  refreshToken: string,
  sessionToken: string,
) => {
  const isSessionExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });
  if (!isSessionExists) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;
  console.log(data);
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.id,
    email: data.email,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.id,
    email: data.email,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      updatedAt: new Date(),
    },
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  if (!session) throw new AppError(status.UNAUTHORIZED, "Session not found");
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
  });

  return { ...result, accessToken, refreshToken };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  return result;
};

const forgotPassword = async (email: string) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (
    isUserExists.status === UserStatus.BLOCKED ||
    isUserExists.status === UserStatus.DELETED
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "User is not allowed to reset password",
    );
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: { email },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (
    isUserExists.status === UserStatus.BLOCKED ||
    isUserExists.status === UserStatus.DELETED
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "User is not allowed to reset password",
    );
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: isUserExists.id,
    },
  });
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
  getNewAccessToken,
  changePassword,
  logoutUser,
  forgotPassword,
  resetPassword,
};
