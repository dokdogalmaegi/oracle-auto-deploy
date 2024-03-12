import { GoogleSheet } from "../googleSheet/GoogleDataAccessService";
import { Cell } from "../../model/googleSheet/Cell";
import { Row } from "../../model/googleSheet/Row";
import { HeaderColumn } from "../../model/googleSheet/HeaderColumn";
import { ReleaseTarget, ReleaseTargetQuery } from "../../model/releases/ReleaseTarget";
import { exec } from "child_process";
import logger from "../../config/logger";
import fs from "fs";
import iconv from "iconv-lite";
import { executeReleaseTargetQueryListFrom } from "../oracle/OracleAccessService";
import { promisify } from "util";
const execPromise = promisify(exec);

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

  const status: string = row.getCellFilteredByHeaderLabel("S")?.value ?? "";
  const uiRelation = row.getCellFilteredByHeaderLabel("UI")?.value ?? "";
  const modifySpec = row.existsCellValueByHeaderLabel("MODIFIED_S");
  const modifyBody = row.existsCellValueByHeaderLabel("MODIFIED_B");

  return status === "R" && uiRelation === "N" && (modifySpec || modifyBody) ? true : false;
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

const updatePackageSource = async () => {
  await execPromise(`cd ${process.env.REPOSITORY_PATH} && git pull origin ${process.env.PACKAGE_BRANCH}`);
};

const getPackage = (packageName: string): { specSql: string; bodySql: string } => {
  const sqlFile = fs.readFileSync(`${process.env.PACKAGE_SOURCE_PATH}/${packageName}.sql`, "binary");
  const packageSql = iconv.decode(Buffer.from(sqlFile, "binary"), "euc-kr").toString();

  const startSpecLocation = packageSql.indexOf(`CREATE OR REPLACE PACKAGE ${packageName}`);
  const endSpecLocation = packageSql.indexOf(`END ${packageName};`);

  const startBodyLocation = packageSql.indexOf(`CREATE OR REPLACE PACKAGE BODY ${packageName}`);
  const endBodyLocation = packageSql.lastIndexOf(`END ${packageName};`);

  return {
    specSql: packageSql.substring(startSpecLocation, endSpecLocation + `END ${packageName};`.length),
    bodySql: packageSql.substring(startBodyLocation, endBodyLocation + `END ${packageName};`.length),
  };
};

export const releasePackage = async (releaseTargetList: ReleaseTarget[], server: string) => {
  logger.info(`Start to release package on ${server} server`);

  logger.info(`Start to update package source`);
  await updatePackageSource();
  logger.info(`Success to update package source`);

  const specSqlList: ReleaseTargetQuery[] = [];
  const bodySqlList: ReleaseTargetQuery[] = [];
  releaseTargetList.forEach((release) => {
    const { specSql, bodySql } = getPackage(release.packageName);

    if (release.isModifySpec) {
      logger.info(`Get ${release.packageName} spec SQL`);
      specSqlList.push({ releaseTarget: release, query: specSql });
    }

    if (release.isModifyBody) {
      logger.info(`Get ${release.packageName} body SQL`);
      bodySqlList.push({ releaseTarget: release, query: bodySql });
    }

    if ((!release.isModifySpec && !release.isModifyBody) || (specSql.length === 0 && bodySql.length === 0)) {
      throw new Error(`No modified SQL for ${release.packageName}`);
    }

    logger.info(`Success to get ${release.packageName} SQL`);
  });

  if (specSqlList.length > 0) {
    logger.info(`Start to release spec package on ${server} server`);
    await executeReleaseTargetQueryListFrom(server, specSqlList);
  }

  if (bodySqlList.length > 0) {
    logger.info(`Start to release body package on ${server} server`);
    await executeReleaseTargetQueryListFrom(server, bodySqlList);
  }

  logger.info(`Success to release package on ${server} server`);
};
