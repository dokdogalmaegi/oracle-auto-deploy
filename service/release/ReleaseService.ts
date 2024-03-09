import { GoogleSheet } from "../googleSheet/GoogleDataAccessService";
import { Cell } from "../../model/googleSheet/Cell";
import { Row } from "../../model/googleSheet/Row";
import { HeaderColumn } from "../../model/googleSheet/HeaderColumn";

export const getRowsWithHeaderColumn = async (
  headerColumns: HeaderColumn[],
  sheetName: string = ""
): Promise<Row[] | undefined> => {
  const firstColumn = headerColumns[0].column;
  const lastColumn = headerColumns[headerColumns.length - 1].column;

  const googleSheet = new GoogleSheet(process.env.SHEET_ID!);
  const rowDataList = await googleSheet.getValuesOf(`${firstColumn}3`, lastColumn, sheetName);

  return rowDataList?.map((cellDataList, rowIdx) => {
    const rowNumber = rowIdx + 3;

    if (cellDataList.length > headerColumns.length) {
      throw new Error(`Row ${rowNumber} has more cells than header columns`);
    }

    const cells = cellDataList.map((value, idx) => {
      return new Cell(headerColumns[idx], rowNumber, value);
    });

    return new Row(cells, rowNumber);
  });
};

export const isReleaseTargetRow = (row: Row): boolean => {
  const status: string | false = row.getCellFilteredByHeaderLabel("S")?.value ?? false;
  const modifySpec: string | false = row.getCellFilteredByHeaderLabel("MODIFIED_S")?.value ?? false;
  const modifyBody: string | false = row.getCellFilteredByHeaderLabel("MODIFIED_B")?.value ?? false;

  return status === "R" && (modifySpec || modifyBody) ? true : false;
};
