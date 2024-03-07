import { Router, Request, Response } from "express";
import { SuccessResponseData } from "../../../utils/ResponseUtils";
import { GoogleSheet } from "../../../service/GoogleDataAccessService";
import fs from "fs";
import path from "path";

const aliveV1Router: Router = Router();

aliveV1Router.get("/", async (req: Request, res: Response) => {
  res.json(new SuccessResponseData("I'm alive").json);
});

export default aliveV1Router;
