import { NextFunction, Request, Response } from "express";
import { FailResponseData } from "../utils/ResponseUtils";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message.includes("ORA-12154") || err.message.includes("NJS-118")) {
    const fialeResponse = new FailResponseData("다시 시도해주세요", new Error("Thick mode change error"))
    res.status(500).json(fialeResponse.json)
    process.exit()
  } else {
    const failResponse = new FailResponseData(err.message, err);
    return res.status(500).json(failResponse.json);
  }
};
