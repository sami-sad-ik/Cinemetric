import { Request, Response } from "express";
import { contentService } from "./content.service";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createContent = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await contentService.createContent(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Content created successfully",
    data: result,
  });
});

const getAllContent = catchAsync(async (req: Request, res: Response) => {
  const result = await contentService.getAllContent();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content fetched successfully",
    data: result,
  });
});

const deleteContent = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await contentService.deleteContent(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content deleted successfully",
    data: result,
  });
});

export const contentController = {
  createContent,
  getAllContent,
  deleteContent,
};
