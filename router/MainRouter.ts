import { Router } from "express";
import aliveV1Router from "./v1/alive/AliveRouter";
import releasesV1Router from "./v1/releases/ReleasesRouter";

const ApiV1Router: Router = Router();

// Define the resrouces for each version
ApiV1Router.use("/alive", aliveV1Router);
ApiV1Router.use("/releases", releasesV1Router);

export default ApiV1Router;
