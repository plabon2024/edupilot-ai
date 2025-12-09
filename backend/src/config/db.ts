import mongoose from "mongoose";
import config from "./env";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl, {
      dbName: config.dbName,
    });
    console.log(`MongoDB Connectd: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
