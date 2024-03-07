import express, { Express } from "express";
import ApiV1Router from "./router/MainRouter";

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", ApiV1Router);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

export default app;
