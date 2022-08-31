import mongoose from "mongoose";
import { Logger } from "pino";
import { Config } from "./config";

export const loadDatabase = async (config: Config, logger: Logger) => {
  const { MONGO_DB_HOST, MONGO_DB_PORT, MONGO_DB_DATABASE } = config;

  logger.info("Connecting to mongo...");

  try {
    await mongoose.connect(
      `mongodb://${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DATABASE}`
    );

    logger.info("MongoDB connected");
  } catch (error) {
    logger.fatal("MongoDB connection error: ", error);
  }
};
