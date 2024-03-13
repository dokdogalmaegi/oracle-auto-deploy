import express, { Express } from "express";
import ApiV1Router from "./router/MainRouter";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger/swagger.json";
import { errorHandler } from "./middleware/ErrorHandler";
import logger, { morganStream } from "./config/logger";
import pageRouter from "./router/PageRouter";

dotenv.config({ path: path.resolve(__dirname, "./config/.env") });

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(":method :status :url :response-time ms", { stream: morganStream }));

app.set("view engine", "ejs");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define the resources restful API
app.use("/api/v1", ApiV1Router);

// Define the resources for web page
app.use("/", pageRouter);

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});

export default app;
