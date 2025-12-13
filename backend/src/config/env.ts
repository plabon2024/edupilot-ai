import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  databaseUrl: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpire: process.env.JWT_EXPIRE as any,
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  fileSize: process.env.MAX_FILE_SIZE
    ? Number(process.env.MAX_FILE_SIZE)
    : 5 * 1024 * 1024,
  dbName: process.env.DB_NAME as string,

};

export default config;
