import { Router, Request, Response, NextFunction } from "express";
import { GoogleSheet } from "../../../service/googleSheet/GoogleDataAccessService";
import { getRowsWithHeaderColumn, isReleaseTargetRow } from "../../../service/release/ReleaseService";
import { SuccessResponseData } from "../../../utils/ResponseUtils";
import { asyncRouter } from "../../../utils/RouterUtils";
import { ReleaseTarget } from "../../../model/releases/ReleaseTarget";

const releasesV1Router: Router = Router();

releasesV1Router.get(
  "/",
  asyncRouter(async (_: Request, res: Response, next: NextFunction) => {
    const googleSheet = new GoogleSheet(process.env.SHEET_ID!);
    const headerColumns = await googleSheet.getHeaderColumnFromTwoRows();
    const rows = await getRowsWithHeaderColumn(headerColumns);

    const releaseTargetList = rows?.filter(isReleaseTargetRow).map((row) => {
      return new ReleaseTarget(
        row.getCellFilteredByHeaderLabel("OBJECT NAME")!.value.trim(),
        row.getCellFilteredByHeaderLabel("MODIFIED_S")!.value.length > 0,
        row.getCellFilteredByHeaderLabel("MODIFIED_B")!.value.length > 0
      );
    });
    const response = new SuccessResponseData("Success to get release data", releaseTargetList || []);
    return res.json(response.json);
  })
);

export default releasesV1Router;
