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

interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
}
interface ILoginUserPayload {
  email: string;
  password: string;
}

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
    emailVerified: data.user.emailVerified,
    isDeleted: data.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
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
    emailVerified: data.user.emailVerified,
    isDeleted: data.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
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

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
    isDeleted: data.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    emailVerified: data.user.emailVerified,
    isDeleted: data.user.isDeleted,
  });
};

export const authService = {
  registerUser,
  loginUser,
  getMe,
  getNewAccessToken,
};
