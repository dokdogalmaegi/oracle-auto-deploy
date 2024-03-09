import { NextFunction, Request, Response } from "express";

export const asyncRouter = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

export const commonRouter = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  try {
    fn(req, res, next);
  } catch (error) {
    next(error);
  }
};
