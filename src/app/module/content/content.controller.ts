/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { contentService } from "./content.service";
import status from "http-status";

const createContent = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await contentService.createContent(payload);

    res.status(status.CREATED).json({
      success: true,
      message: "Content created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create content",
      error: error.message,
    });
  }
};

const getAllContent = async (req: Request, res: Response) => {
  try {
    const result = await contentService.getAllContent();
    res.status(status.OK).json({
      success: true,
      message: "Content retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get all content",
      error: error.message,
    });
  }
};

const deleteContent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await contentService.deleteContent(id as string);
    res.status(status.OK).json({
      success: true,
      message: "Content deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete content",
      error: error.message,
    });
  }
};

export const contentController = {
  createContent,
  getAllContent,
  deleteContent,
};
