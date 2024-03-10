import OracleDB from "oracledb";
import { ServerConnection } from "../../model/oracle/OracleConnectionInfo";
import logger from "../../config/logger";

const getConnection = async (server: string) => {
  const serverConnection = new ServerConnection(server);

  logger.info(`Try to connect to ${server} server`);
  return await OracleDB.getConnection(serverConnection.connectionInfo);
};

export const compileSql = async (sql: string, server: string) => {
  const connection = await getConnection(server);

  logger.info(`Try to compile SQL on ${server} server`);
  await connection.execute(sql);
  await connection.close();
};

export const executeSqlList = async (sqlList: string[], connection: OracleDB.Connection, tryCount: number = 0) => {
  try {
    for (const sql of sqlList) {
      await connection.execute(sql);
    }
  } catch (error) {
    if (tryCount < 3) {
      logger.warn(`Failed to execute SQL on ${connection.oracleServerVersion}, try again`);
      await executeSqlList(sqlList, connection, tryCount + 1);
    } else {
      throw new Error(`Failed to execute SQL on ${connection.oracleServerVersion}`);
    }
  }
};
