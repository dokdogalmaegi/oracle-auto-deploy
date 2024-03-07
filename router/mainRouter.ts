import { Router } from "express";
import aliveV1Router from "./v1/alive";

const apiV1Router: Router = Router();

apiV1Router.use("/alive", aliveV1Router);

export default apiV1Router;
