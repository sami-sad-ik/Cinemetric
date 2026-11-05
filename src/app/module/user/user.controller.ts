import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { userService } from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getMe(req.user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateMyProfile(req.user.userId, {
    name: req.body.name,
    profileImage: req.file?.path ?? req.body.profileImage,
  });
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateUserByAdmin(
    req.user,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const handleSubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await userService.handleSubscription(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Subscription handled successfully",
    data: result,
  });
});

export const userController = {
  getMe,
  updateMyProfile,
  updateUserByAdmin,
  handleSubscription,
};
