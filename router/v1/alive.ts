import { Router, Request, Response } from "express";

const aliveV1Router: Router = Router();

aliveV1Router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server Alive" });
});

export default aliveV1Router;
