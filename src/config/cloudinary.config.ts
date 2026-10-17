import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import status from "http-status";
import AppError from "../app/errorHelpers/AppError";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CONFIG.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_CONFIG.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_CONFIG.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = cloudinary;

export const uploadFileToCloudinary = async (
  buffer: Buffer,
  filename: string,
): Promise<UploadApiResponse> => {
  const extension = filename.split(".").pop();
  const fileNameWithoutExtension = filename
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const uniqueName =
    Math.random().toString(36).substring(2, 8) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;
  const folder = extension === "pdf" ? "pdfs" : "images";
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `Cinemetric/${folder}`,
          public_id: uniqueName,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(
                status.INTERNAL_SERVER_ERROR,
                "Error uploading file to cloudinary",
              ),
            );
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      )
      .end(buffer);
  });
};

export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (match) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
      console.log(`File ${publicId} deleted from Cloudinary`);
    }
  } catch (error) {
    console.log("Error deleting file from cloudinary", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error deleting file from cloudinary",
    );
  }
};
