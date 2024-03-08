import { Router, Request, Response } from "express";
import { GoogleSheet } from "../../../service/googleSheet/GoogleDataAccessService";
import { getRows, isReleaseTargetRow } from "../../../service/release/ReleaseService";
import { SuccessResponseData } from "../../../utils/ResponseUtils";

const releasesV1Router: Router = Router();

releasesV1Router.get("/", async (req: Request, res: Response) => {
  const googleSheet = new GoogleSheet(process.env.SHEET_ID!);
  const headerColumns = await googleSheet.getHeaderColumnFromTwoRows();
  const rows = await getRows(headerColumns);

  const releaseTargetTableList = rows?.filter(isReleaseTargetRow).map((row) => {
    return row.getCellFilteredByHeaderLabel("OBJECT NAME")?.value.trim();
  });
  const response = new SuccessResponseData("Success to get release data", [...new Set(releaseTargetTableList)] || []);

  res.json(response.json);
});

export default releasesV1Router;
