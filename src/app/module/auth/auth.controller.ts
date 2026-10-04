import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { authService } from "./auth.service";

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
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

export const authController = {
  registerUser,
  loginUser,
  getMe,
};
