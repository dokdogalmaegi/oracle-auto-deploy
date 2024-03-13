import { Request, Response, Router } from "express";

const pageRouter: Router = Router();

pageRouter.get("/release", (req: Request, res: Response) => {
  res.render("release", { title: "Release Page" });
});

export default pageRouter;
