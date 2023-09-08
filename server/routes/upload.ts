import fs from "fs";
import express, { Request, Response } from "express";
import { UPLOAD_DIR } from "../constants";

const uploadRouter = express.Router();

uploadRouter.post("", (req: Request, res: Response) => {
  const filename = req.headers["file-name"] as string;

  req.on("data", (chunk) => {
    fs.appendFileSync(`${UPLOAD_DIR}/${filename}`, chunk);
  });
  return res.status(200).send("Chunk uploaded successfuly");
});

export default uploadRouter;
