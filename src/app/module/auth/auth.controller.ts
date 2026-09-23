import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";

const registerUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerUser(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const authController = {
  registerUser,
};
