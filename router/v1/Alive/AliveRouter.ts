import { Router, Request, Response } from "express";
import { SuccessResponseData } from "../../../utils/ResponseUtils";

const aliveV1Router: Router = Router();

aliveV1Router.get("/", (req: Request, res: Response) => {
  res.json(new SuccessResponseData("I'm alive").json);
});

export default aliveV1Router;
