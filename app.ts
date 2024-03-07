import express, { Express } from "express";
import apiV1Router from "./router/mainRouter";

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", apiV1Router);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

export default app;
