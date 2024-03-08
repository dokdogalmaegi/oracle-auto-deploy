import express, { Express } from "express";
import ApiV1Router from "./router/MainRouter";
import fs from "fs";
import path from "path";

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1", ApiV1Router);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

const sheetInfoUrl = path.resolve(__dirname, "config/sheetInfo.json");
const sheetInfo = JSON.parse(fs.readFileSync(sheetInfoUrl, "utf8"));

process.env.TEST_SPREAD_SHEET_ID = sheetInfo.testSpreadSheetId;

export default app;
