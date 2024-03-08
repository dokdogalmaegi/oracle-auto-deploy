import { Router, Request, Response } from "express";
import { GoogleSheet } from "../../../service/googleSheet/GoogleDataAccessService";
import { getRows } from "../../../service/release/ReleaseService";

const releasesV1Router: Router = Router();

releasesV1Router.get("/", async (req: Request, res: Response) => {
  const googleSheet = new GoogleSheet(process.env.TEST_SPREAD_SHEET_ID!);
  const headerColumns = await googleSheet.getHeaderColumnFromTwoRows();
  const rows = await getRows(headerColumns);

  if (rows) {
    console.log(rows[0].getCellFilteredByHeaderLabel("Dev_B"));
  }

  res.json({ message: "releases" });
});

export default releasesV1Router;
