import path from "path";
import fs from "fs";
import { GoogleSheet } from "../googleSheet/GoogleDataAccessService";
import { Cell } from "../../model/googleSheet/Cell";
import { Row } from "../../model/googleSheet/Row";
import { HeaderColumn } from "../../model/googleSheet/HeaderColumn";

const sheetInfoUrl = path.resolve(__dirname, "../../config/sheetInfo.json");
const sheetInfo = JSON.parse(fs.readFileSync(sheetInfoUrl, "utf8"));

const googleSheet = new GoogleSheet(sheetInfo.testSpreadSheetId);

export const getRows = async (headerColumns: HeaderColumn[], sheetId: string = ""): Promise<Row[] | undefined> => {
  const firstColumn = headerColumns[0].column;
  const lastColumn = headerColumns[headerColumns.length - 1].column;
  const rowDataList = await googleSheet.getValuesOf(`${firstColumn}3`, lastColumn);

  return rowDataList?.map((row, rowIdx) => {
    const rowNumber = rowIdx + 3;
    const cells = row.map((value, idx) => {
      return new Cell(headerColumns[idx], rowNumber, value);
    });

    return new Row(cells, rowNumber);
  });
};
