import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
const config = {
  databaseUrl: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpire: process.env.JWT_EXPIRE as string,
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  nodeEnv: process.env.NODE_ENV as string,
  fileSize: process.env.MAX_FILE_SIZE,
  dbName: process.env.DB_NAME as string,
  baseUrl:process.env.baseUrl
};
export default config;
