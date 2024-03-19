import { Router, Request, Response, NextFunction } from "express";
import { GoogleSheet } from "../../../service/googleSheet/GoogleDataAccessService";
import { getReleaseTargetList, getRowsWithHeaderColumn, releasePackage } from "../../../service/release/ReleaseService";
import { SuccessResponseData } from "../../../utils/ResponseUtils";
import { asyncRouter } from "../../../utils/RouterUtils";
import logger from "../../../config/logger";

const releasesV1Router: Router = Router();

releasesV1Router.get(
  "/",
  asyncRouter(async (req: Request, res: Response, next: NextFunction) => {
    const { sheetName, uiStatus } = req.query;

    const googleSheet = new GoogleSheet(process.env.SHEET_ID!);

    const headerColumns = await googleSheet.getHeaderColumnFromTwoRows(sheetName as string | undefined);
    const rows = await getRowsWithHeaderColumn(headerColumns, sheetName as string | undefined);

    let uiStatusList = null;
    if (typeof uiStatus === "string") {
      uiStatusList = uiStatus
        .split(",")
        .filter((s: string) => s.length > 0)
        .map((s: string) => s.trim());
    }

    const invalidUiStatusList = uiStatusList?.filter((s: string) => s.length !== 1);
    if (invalidUiStatusList && invalidUiStatusList.length > 0) {
      throw new Error(`Invalid UI status: ${invalidUiStatusList}`);
    }
    const releaseTargetList = getReleaseTargetList(rows, uiStatusList);
    logger.info(`Success to get release target data.\ndata: ${JSON.stringify(releaseTargetList)}`);

    const response = new SuccessResponseData("Success to get release target data", releaseTargetList);
    return res.json(response.json);
  })
);

releasesV1Router.post(
  "/",
  asyncRouter(async (req: Request, res: Response, next: NextFunction) => {
    const { server, uiStatus } = req.body;
    const { sheetName } = req.query;
    if (!server || server.length === 0) {
      throw new Error("Server name is required");
    }

    const googleSheet = new GoogleSheet(process.env.SHEET_ID!);

    const headerColumns = await googleSheet.getHeaderColumnFromTwoRows(sheetName as string | undefined);
    const rows = await getRowsWithHeaderColumn(headerColumns, sheetName as string | undefined);

    const uiStatusList =
      uiStatus
        .split(",")
        .filter((s: string) => s.length > 0)
        .map((s: string) => s.trim()) ?? null;
    const invalidUiStatusList = uiStatusList?.filter((s: string) => s.length !== 1);
    if (invalidUiStatusList && invalidUiStatusList.length > 0) {
      throw new Error(`Invalid UI status: ${invalidUiStatusList}`);
    }
    const releaseTargetList = getReleaseTargetList(rows, uiStatusList);

    await releasePackage(releaseTargetList, server);

    const response = new SuccessResponseData("Success to release package", releaseTargetList);
    return res.json(response.json);
  })
);

export default releasesV1Router;
