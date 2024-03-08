import { GoogleSheet } from "../googleSheet/GoogleDataAccessService";
import { Cell } from "../../model/googleSheet/Cell";
import { Row } from "../../model/googleSheet/Row";
import { HeaderColumn } from "../../model/googleSheet/HeaderColumn";

export const getRows = async (headerColumns: HeaderColumn[], sheetId: string = ""): Promise<Row[] | undefined> => {
  const firstColumn = headerColumns[0].column;
  const lastColumn = headerColumns[headerColumns.length - 1].column;

  const googleSheet = new GoogleSheet(process.env.SHEET_ID!);
  const rowDataList = await googleSheet.getValuesOf(`${firstColumn}3`, lastColumn);

  return rowDataList?.map((row, rowIdx) => {
    const rowNumber = rowIdx + 3;
    const cells = row.map((value, idx) => {
      return new Cell(headerColumns[idx], rowNumber, value);
    });

    return new Row(cells, rowNumber);
  });
};

export const isReleaseTargetRow = (row: Row): boolean => {
  const status = row.getCellFilteredByHeaderLabel("S");
  const modifySpec = row.getCellFilteredByHeaderLabel("MODIFIED_S");
  const modifyBody = row.getCellFilteredByHeaderLabel("MODIFIED_B");

  return status?.value === "R" && (modifySpec || modifyBody) ? true : false;
};
