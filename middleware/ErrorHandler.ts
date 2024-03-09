import { NextFunction, Request, Response } from "express";
import { FailResponseData } from "../utils/ResponseUtils";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const failResponse = new FailResponseData("Internal Server Error", err);
  return res.status(500).json(failResponse.json);
};
