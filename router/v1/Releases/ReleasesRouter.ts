import { Router, Request, Response } from "express";

const releasesV1Router: Router = Router();

releasesV1Router.get("/", async (req: Request, res: Response) => {});

export default releasesV1Router;
