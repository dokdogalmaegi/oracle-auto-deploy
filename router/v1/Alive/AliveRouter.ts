import { Router, Request, Response } from "express";
import { SuccessResponseData } from "../../../utils/ResponseUtils";
import { GoogleSheet } from "../../../service/GoogleDataAccessService";
import fs from "fs";
import path from "path";

const aliveV1Router: Router = Router();

aliveV1Router.get("/", async (req: Request, res: Response) => {
  const sheetInfoPath = path.resolve(
    __dirname,
    "../../../config/sheetInfo.json"
  );
  const sheetInfo = fs.readFileSync(sheetInfoPath, "utf8");
  const { testSpreadSheetId } = JSON.parse(sheetInfo);
  const googleSheet = new GoogleSheet(testSpreadSheetId);

  console.log(await googleSheet.getValuesOf("A3", "A3"));

  res.json(new SuccessResponseData("I'm alive").json);
});

export default aliveV1Router;
