import mongoose from "mongoose";
import logger from "./logger";

export default async function connectToDB() {
  const dbUri = process.env.dbUri;

  if (!dbUri) {
    throw new Error("No connection string provided");
  }

  try {
    await mongoose.connect(dbUri);
    logger.info("[db]: Connected to the database");
  } catch (error) {
    logger.error("[db]: Unable to connect to the database");
    process.exit(1);
  }
}
