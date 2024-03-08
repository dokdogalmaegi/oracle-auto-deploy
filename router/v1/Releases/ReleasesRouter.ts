import { Router, Request, Response } from "express";
import { GoogleSheet } from "../../../service/googleSheet/GoogleDataAccessService";
import path from "path";
import fs from "fs";
import { Row } from "../../../model/googleSheet/Row";
import { Cell } from "../../../model/googleSheet/Cell";

const releasesV1Router: Router = Router();

releasesV1Router.get("/", async (req: Request, res: Response) => {
  const sheetInfoUrl = path.resolve(__dirname, "../../../config/sheetInfo.json");
  const sheetInfo = JSON.parse(fs.readFileSync(sheetInfoUrl, "utf8"));

  const googleSheet = new GoogleSheet(sheetInfo.testSpreadSheetId);

  const headerColumn = await googleSheet.getHeaderColumnFromTwoRows();
  const firstColumn = headerColumn[0].column;
  const lastColumn = headerColumn[headerColumn.length - 1].column;
  const rowDataList = await googleSheet.getValuesOf(`${firstColumn}3`, lastColumn);
  const rows = rowDataList?.map((row, rowIdx): Row => {
    const rowNumber = rowIdx + 3;
    const cells = row.map((value, idx): Cell => {
      return new Cell(headerColumn[idx], rowNumber, value);
    });

    return new Row(cells, rowNumber);
  });
  if (rows) {
    console.log(rows[0].getCellFilteredByHeaderLabel("Dev_B"));
  }

  res.json({ message: "releases" });
});

export default releasesV1Router;
