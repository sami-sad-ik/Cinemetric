import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { authService } from "./auth.service";
import AppError from "../../errorHelpers/AppError";

const registerUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerUser(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setBetterAuthSessionToken(res, token as string);
  tokenUtils.setAccessToken(res, accessToken as string);
  tokenUtils.setRefreshToken(res, refreshToken as string);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setBetterAuthSessionToken(res, token as string);
  tokenUtils.setAccessToken(res, accessToken as string);
  tokenUtils.setRefreshToken(res, refreshToken as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await authService.getMe(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const getNewAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  if (!refreshToken || !betterAuthSessionToken) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Refresh token or session token is missing",
    );
  }
  const result = await authService.getNewAccessToken(
    refreshToken,
    betterAuthSessionToken,
  );
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

  tokenUtils.setBetterAuthSessionToken(res, sessionToken as string);
  tokenUtils.setAccessToken(res, accessToken as string);
  tokenUtils.setRefreshToken(res, newRefreshToken as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New access token generated successfully",
    data: result,
  });
});

export const authController = {
  registerUser,
  loginUser,
  getMe,
  getNewAccessToken,
};
