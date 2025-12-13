import cloudinary from "../config/cloudinary";
import config from "../config/env";

export const uploadPDFToCloudinary = async (filePath: string) => {

  return cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
 
    use_filename: true,
    unique_filename: true,
    upload_preset: config.cloudinaryUploadPreset,
  });
};
