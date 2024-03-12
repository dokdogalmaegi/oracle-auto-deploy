import express, { Express } from "express";
import ApiV1Router from "./router/MainRouter";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import { errorHandler } from "./middleware/ErrorHandler";
import logger, { morganStream } from "./config/logger";

dotenv.config({ path: path.resolve(__dirname, "./config/.env") });

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(":method :status :url :response-time ms", { stream: morganStream }));

app.use("/api/v1", ApiV1Router);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});

export default app;
