import { Router } from "express";
import aliveV1Router from "./v1/Alive/AliveRouter";
import releasesV1Router from "./v1/Releases/ReleasesRouter";

const ApiV1Router: Router = Router();

ApiV1Router.use("/alive", aliveV1Router);
ApiV1Router.use("/releases", releasesV1Router);

export default ApiV1Router;
