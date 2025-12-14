import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  databaseUrl: process.env.MONGODB_URI as string,

  jwtSecret: process.env.JWT_SECRET as any,

  jwtExpire: (process.env.JWT_EXPIRE ?? "7d") as
   any,

  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  fileSize: process.env.MAX_FILE_SIZE
    ? Number(process.env.MAX_FILE_SIZE)
    : 5 * 1024 * 1024,

  dbName: process.env.DB_NAME as string,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET as string,
};


export default config;
