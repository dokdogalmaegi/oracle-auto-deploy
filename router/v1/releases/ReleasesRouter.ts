import { Router, Request, Response, NextFunction } from "express";
import { GoogleSheet } from "../../../service/googleSheet/GoogleDataAccessService";
import { getReleaseTargetList, getRowsWithHeaderColumn } from "../../../service/release/ReleaseService";
import { SuccessResponseData } from "../../../utils/ResponseUtils";
import { asyncRouter } from "../../../utils/RouterUtils";
import logger from "../../../config/logger";

const releasesV1Router: Router = Router();

releasesV1Router.get(
  "/",
  asyncRouter(async (_: Request, res: Response, next: NextFunction) => {
    const googleSheet = new GoogleSheet(process.env.SHEET_ID!);

    const headerColumns = await googleSheet.getHeaderColumnFromTwoRows();
    const rows = await getRowsWithHeaderColumn(headerColumns);

    const releaseTargetList = getReleaseTargetList(rows);
    logger.info(`Success to get release target data.\ndata: ${JSON.stringify(releaseTargetList)}`);

    const response = new SuccessResponseData("Success to get release target data", releaseTargetList);
    return res.json(response.json);
  })
);

export default releasesV1Router;
