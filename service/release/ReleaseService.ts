import { GoogleSheet } from "../googleSheet/GoogleDataAccessService";
import { Cell } from "../../model/googleSheet/Cell";
import { Row } from "../../model/googleSheet/Row";
import { HeaderColumn } from "../../model/googleSheet/HeaderColumn";
import { ReleaseTarget } from "../../model/releases/ReleaseTarget";
import { exec } from "child_process";

export const getRowsWithHeaderColumn = async (
  headerColumns: HeaderColumn[],
  sheetName: string = ""
): Promise<Row[]> => {
  const firstColumn = headerColumns[0].column;
  const lastColumn = headerColumns[headerColumns.length - 1].column;

  const googleSheet = new GoogleSheet(process.env.SHEET_ID!);
  const rowDataList = await googleSheet.getValuesOf(`${firstColumn}3`, lastColumn, sheetName);

  if (!rowDataList) {
    return [];
  } else {
    return rowDataList.map((cellDataList, rowIdx) => {
      const rowNumber = rowIdx + 3;

      if (cellDataList.length > headerColumns.length) {
        throw new Error(`Row ${rowNumber} has more cells than header columns`);
      }

      const cells = cellDataList.map((value, idx) => {
        return new Cell(headerColumns[idx], rowNumber, value);
      });

      return new Row(cells, rowNumber);
    });
  }
};

const isReleaseTargetRow = (row: Row): boolean => {
  const modifyTable = row.existsCellValueByHeaderLabel("MODIFIED_T");
  const modifyData = row.existsCellValueByHeaderLabel("MODIFIED_D");
  if (modifyTable || modifyData) {
    return false;
  }

  const status: string | false = row.getCellFilteredByHeaderLabel("S")?.value ?? false;
  const modifySpec = row.existsCellValueByHeaderLabel("MODIFIED_S");
  const modifyBody = row.existsCellValueByHeaderLabel("MODIFIED_B");

  return status === "R" && (modifySpec || modifyBody) ? true : false;
};

export const getReleaseTargetList = (rows: Row[]): ReleaseTarget[] => {
  const releaseList = rows.filter(isReleaseTargetRow).map((row) => {
    return new ReleaseTarget(
      row.getCellFilteredByHeaderLabel("OBJECT NAME")!.value.trim(),
      row.getCellFilteredByHeaderLabel("MODIFIED_S")!.value.length > 0,
      row.getCellFilteredByHeaderLabel("MODIFIED_B")!.value.length > 0
    );
  });

  const releaseTargetNames = [...new Set(releaseList.map((release) => release.packageName))];

  return releaseTargetNames.map((packageName) => {
    const packageItems = releaseList.filter((release) => release.packageName === packageName);

    return new ReleaseTarget(
      packageName,
      packageItems.some((item) => item.isModifySpec),
      packageItems.some((item) => item.isModifyBody)
    );
  });
};

const updatePackageSource = () => {
  exec(
    `cd ${process.env.PACKAGE_SOURCE_PATH} && git pull origin ${process.env.PACKAGE_BRANCH}`,
    (error, stdout, stderr) => {
      if (error) {
        throw error;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }

      console.log(`stdout: ${stdout}`);
    }
  );
};
