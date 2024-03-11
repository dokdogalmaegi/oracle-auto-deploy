import OracleDB from "oracledb";
import { ServerConnection } from "../../model/oracle/OracleConnectionInfo";
import logger from "../../config/logger";

const getConnection = async (server: string) => {
  const serverConnection = new ServerConnection(server);

  logger.info(`Try to connect to ${server} server`);
  return await OracleDB.getConnection(serverConnection.connectionInfo);
};

const executeSqlList = async (
  sqlList: string[],
  connection: OracleDB.Connection,
  tryCount: number = 0,
  tryMaxCount: number = 5
) => {
  const errorSqlList: string[] = [];
  let currentSql: string = "";
  try {
    for (const sql of sqlList) {
      currentSql = sql;
      await connection.execute(sql);
    }
  } catch (error) {
    logger.error(`Error: ${error}`);
    errorSqlList.push(currentSql);
  }

  if (errorSqlList.length > 0 && tryCount < tryMaxCount) {
    logger.warn(`Retry executing SQL list on ${errorSqlList.length} SQLs on ${connection.oracleServerVersion} server.`);
    logger.warn(`Retry count is ${tryCount + 1}, Remaining count is ${tryMaxCount - tryCount - 1}`);
    await executeSqlList(errorSqlList, connection, tryCount + 1);
  } else if (errorSqlList.length > 0 && tryCount >= tryMaxCount) {
    logger.error(`Failed to execute query\n${errorSqlList.join("\n----------------\n")}`);
    throw new Error(`Failed to execute SQL on ${connection.oracleServerVersion} after ${tryMaxCount} times, skip it`);
  } else {
    logger.info(`Success to execute SQL list on ${connection.oracleServerVersion} server`);
    logger.info(`SQL count is ${sqlList.length}`);
  }
};

export const executeSqlListFrom = async (server: string, sqlList: string[]) => {
  const connection = await getConnection(server);

  logger.info(`Try to compile SQL on ${server} server`);
  await executeSqlList(sqlList, connection);
  await connection.close();
};
