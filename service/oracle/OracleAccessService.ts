import OracleDB from "oracledb";
import { ServerConnection } from "../../model/oracle/OracleConnectionInfo";
import logger from "../../config/logger";
import { ReleaseTarget, ReleaseTargetQuery } from "../../model/releases/ReleaseTarget";

const getConnection = async (server: string) => {
  const serverConnection = new ServerConnection(server);

  logger.info(`Try to connect to ${server} server`);
  return await OracleDB.getConnection(serverConnection.connectionInfo);
};

const executeSqlList = async (
  sqlList: string[],
  connection: OracleDB.Connection,
  tryCount: number = 0,
  tryMaxCount: number = 3
) => {
  const errorSqlList: string[] = [];
  let currentSql: string = "";
  try {
    for (const sql of sqlList) {
      currentSql = sql;
      // await connection.execute(sql);
    }
  } catch (error) {
    logger.error(`Error: ${error}`);
    errorSqlList.push(currentSql);
  }

  if (errorSqlList.length > 0) {
    if (tryCount < tryMaxCount) {
      logger.warn(
        `Retry executing SQL list on ${errorSqlList.length} SQLs on ${connection.oracleServerVersion} server.`
      );
      logger.warn(`Retry count is ${tryCount + 1}, Remaining count is ${tryMaxCount - tryCount - 1}`);
      await executeSqlList(errorSqlList, connection, tryCount + 1);
    } else {
      logger.error(`Failed to execute query\n${errorSqlList.join("\n----------------\n")}`);
      throw new Error(`Failed to execute SQL on ${connection.oracleServerVersion} after ${tryMaxCount} times, skip it`);
    }
  } else {
    logger.info(`Success to execute SQL list on ${connection.oracleServerVersion} server`);
    logger.info(`SQL count is ${sqlList.length}`);
  }
};

const getInvalidRelaseTarget = async (releaseTargetQueries: ReleaseTargetQuery[], connection: OracleDB.Connection) => {
  const invalidReleaseTargetList: ReleaseTargetQuery[] = releaseTargetQueries;
  const invalidSpecList: ReleaseTargetQuery[] = [];
  const invalidBodyList: ReleaseTargetQuery[] = [];

  const checkInvalidPackageNameList = releaseTargetQueries
    .map((releaseTargetQuery) => "'" + releaseTargetQuery.releaseTarget.packageName + "'")
    .join(",");
  const checkInvalidSql = `SELECT OBJECT_NAME, OBJECT_TYPE FROM ALL_OBJECTS WHERE OBJECT_TYPE IN ('PACKAGE', 'PACKAGE BODY') AND STATUS = 'INVALID' AND OBJECT_NAME IN (${checkInvalidPackageNameList})`;
  logger.info(`Check invalid SQL: ${checkInvalidSql}`);
  const result = await connection.execute(checkInvalidSql);

  if (result.rows) {
    const specList: ReleaseTargetQuery[] = releaseTargetQueries.filter(
      (releaseTargetQuery) => releaseTargetQuery.releaseTarget.isModifySpec
    );
    const bodyList: ReleaseTargetQuery[] = releaseTargetQueries.filter(
      (releaseTargetQuery) => releaseTargetQuery.releaseTarget.isModifyBody
    );

    invalidSpecList.push(
      ...result.rows
        // @ts-ignore
        .filter((row: any[]) => row[1] === "PACKAGE")
        // @ts-ignore
        .map((row: any[]) =>
          specList.find((releaseTargetQuery) => releaseTargetQuery.releaseTarget.packageName === row[0])
        )
        .filter(
          (releaseTargetQuery: ReleaseTargetQuery | undefined): releaseTargetQuery is ReleaseTargetQuery =>
            !!releaseTargetQuery
        )
    );
    invalidBodyList.push(
      ...result.rows
        // @ts-ignore
        .filter((row: any[]) => row[1] === "PACKAGE BODY")
        // @ts-ignore
        .map((row: any[]) =>
          bodyList.find((releaseTargetQuery) => releaseTargetQuery.releaseTarget.packageName === row[0])
        )
        .filter(
          (releaseTargetQuery: ReleaseTargetQuery | undefined): releaseTargetQuery is ReleaseTargetQuery =>
            !!releaseTargetQuery
        )
    );
  }

  return invalidReleaseTargetList
    .map((invalidReleaseTarget: ReleaseTargetQuery) => {
      const isModifySpec = invalidSpecList.some(
        (invalidSpec) => invalidSpec.releaseTarget.packageName === invalidReleaseTarget.releaseTarget.packageName
      );
      const isModifyBody = invalidBodyList.some(
        (invalidBody) => invalidBody.releaseTarget.packageName === invalidReleaseTarget.releaseTarget.packageName
      );

      const releaseTarget = new ReleaseTarget(
        invalidReleaseTarget.releaseTarget.packageName,
        isModifySpec,
        isModifyBody
      );
      return { releaseTarget, query: invalidReleaseTarget.query };
    })
    .filter(
      (invalidReleaseTarget) =>
        invalidReleaseTarget.releaseTarget.isModifySpec || invalidReleaseTarget.releaseTarget.isModifyBody
    );
};

export const executeReleaseTargetQueryListFrom = async (
  server: string,
  releaseTargetQueries: ReleaseTargetQuery[],
  tryCount = 0,
  maxTryCount = 3
) => {
  const connection = await getConnection(server);

  logger.info(`Try to compile SQL on ${server} server`);
  const sqlList = releaseTargetQueries.map((releaseTargetQuery) => releaseTargetQuery.query);
  await executeSqlList(sqlList, connection);

  const invalidReleaseTarget = await getInvalidRelaseTarget(releaseTargetQueries, connection);
  if (invalidReleaseTarget.length > 0) {
    if (tryCount < maxTryCount) {
      logger.warn(`Retry compiling SQL on ${invalidReleaseTarget.length} SQLs on ${server} server.`);
      logger.warn(
        `Invalid release target: ${invalidReleaseTarget
          .map((releaseTarget) => releaseTarget.releaseTarget.packageName)
          .join(", ")}`
      );
      logger.warn(`Retry count is ${tryCount + 1}, Remaining count is ${maxTryCount - tryCount - 1}`);
      await executeReleaseTargetQueryListFrom(server, invalidReleaseTarget, tryCount + 1);
    } else {
      logger.error(`Failed to compile SQL on ${server} after ${maxTryCount} times, skip it`);
      throw new Error(`Failed to compile SQL on ${server} after ${maxTryCount} times, skip it`);
    }
  }

  await connection.close();
};
