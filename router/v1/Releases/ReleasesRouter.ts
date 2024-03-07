import { Router, Request, Response } from "express";
import { GoogleSheet } from "../../../service/GoogleSheet/GoogleDataAccessService";
import path from "path";
import fs from "fs";

const releasesV1Router: Router = Router();

releasesV1Router.get("/", async (req: Request, res: Response) => {
  const sheetInfoUrl = path.resolve(
    __dirname,
    "../../../config/sheetInfo.json"
  );
  const sheetInfo = JSON.parse(fs.readFileSync(sheetInfoUrl, "utf8"));

  const googleSheet = new GoogleSheet(sheetInfo.testSpreadSheetId);

  const headerColumn = await googleSheet.getHeaderColumnFromTwoRows();
  console.log(headerColumn);

  res.json({ message: "releases" });
});

export default releasesV1Router;
