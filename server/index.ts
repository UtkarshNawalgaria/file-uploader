import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload";
import connectToDB from "./utils/db";
import logger from "./utils/logger";

dotenv.config();

const CORS_ORIGIN = ["http://localhost:5173"];

async function startServer() {
  const app: Express = express();
  app.use(express.json());
  app.use(
    cors({
      origin: CORS_ORIGIN,
    })
  );

  return app;
}

async function main() {
  const app = await startServer();
  await connectToDB();

  const PORT = process.env.PORT ?? 8000;

  app.use("/upload", uploadRouter);

  try {
    await app.listen(+PORT, () => {
      logger.info(`[server]: Server running at http://localhost:${+PORT}`);
    });
  } catch (err) {
    logger.error("Server not started");
    process.exit(1);
  }
}

main();
