import { Router } from "express";
import aliveV1Router from "./v1/Alive/AliveRouter";

const ApiV1Router: Router = Router();

ApiV1Router.use("/alive", aliveV1Router);

export default ApiV1Router;
