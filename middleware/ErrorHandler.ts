import { NextFunction, Request, Response } from "express";
import { FailResponseData } from "../utils/ResponseUtils";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const failResponse = new FailResponseData(err.message, err);
  if (err.message === "ORA-12154: TNS:could not resolve the connect identifier specified") {
    throw err;
  }
  return res.status(500).json(failResponse.json);
};
