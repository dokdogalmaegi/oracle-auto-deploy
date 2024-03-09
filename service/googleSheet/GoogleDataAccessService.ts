import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { ValueInputOption, InsertDataOption } from "../enums/GoogleSheetEnums";
import { HeaderColumn } from "../../model/googleSheet/HeaderColumn";

const apiAuthPath = path.resolve(__dirname, "../../config/apiAuth.json");
const apiAuthJson = JSON.parse(fs.readFileSync(apiAuthPath, "utf8"));
const { client_email: clientEmail, private_key: privateKey } = apiAuthJson;

const SHEET_API_URL = "https://www.googleapis.com/auth/spreadsheets";

export class GoogleSheet {
  #sheetApi: any;
  #spreadSheetId: string;

  constructor(spreadSheetId: string) {
    if (!spreadSheetId) {
      throw new Error("SpreadSheetId is required");
    }

    const authorize = new google.auth.JWT(clientEmail, undefined, privateKey, [SHEET_API_URL]);

    this.#sheetApi = google.sheets({
      version: "v4",
      auth: authorize,
    });

    this.#spreadSheetId = spreadSheetId;
  }

  async getValuesOf(startCell: string, endCell: string, sheetName: string = ""): Promise<string[][] | undefined> {
    let range = `${startCell}:${endCell}`;

    if (sheetName.length > 0) {
      range = `${sheetName}!${range}`;
    }

    return await this.#getValueOf(range);
  }

  async getOneCellValuesOf(cell: string, sheetName: string = ""): Promise<string[][] | undefined> {
    return await this.getValuesOf(cell, cell, sheetName);
  }

  async #getValueOf(range: string): Promise<string[][] | undefined> {
    const {
      data: { values },
    } = await this.#sheetApi.spreadsheets.values.get({
      spreadsheetId: this.#spreadSheetId,
      range,
    });

    return values;
  }

  async #getLastNumberByCell(cell: string = "A"): Promise<number> {
    const START_NUMBER: Number = 1;
    const range: string = `${cell}${START_NUMBER}:${cell}`;

    const {
      data: { values },
    } = await this.#sheetApi.spreadsheets.values.get({
      spreadsheetId: this.#spreadSheetId,
      range,
    });

    return values.length;
  }

  async insertValueToCell(location: string, value: any): Promise<void> {
    const range = `${location}:${location}`;
    const resource = {
      values: [[value]],
    };

    await this.#insertValueToCell(range, resource);
  }

  async insertValuesToRow(start: string, end: string, value: any[]): Promise<void> {
    const range = `${start}:${end}`;
    const resource = {
      values: [value],
    };

    await this.#insertValueToCell(range, resource);
  }

  async #insertValueToCell(range: string, resource: any): Promise<void> {
    await this.#sheetApi.spreadsheets.values.update({
      spreadsheetId: this.#spreadSheetId,
      valueInputOption: ValueInputOption.RAW,
      range,
      resource,
    });
  }

  async appendValueToCell(cell: string, value: any): Promise<void> {
    const range = `${cell}1:${cell}${await this.#getLastNumberByCell(cell)}`;
    const resource = {
      values: [[value]],
    };

    await this.#appendValuesToCell(range, resource);
  }

  async appendValueMany(
    start: string,
    end: string,
    values: any[],
    options: { plusNumber: number } = { plusNumber: 0 }
  ): Promise<void> {
    const lastNumber = await this.#getLastNumberByCell(start);
    const range = `${start}${lastNumber + options.plusNumber}:${end}${lastNumber + options.plusNumber}`;
    const resource = {
      values: [values],
    };

    await this.#appendValuesToCell(range, resource);
  }

  async #appendValuesToCell(range: string, resource: any): Promise<void> {
    await this.#sheetApi.spreadsheets.values.append({
      spreadsheetId: this.#spreadSheetId,
      insertDataOption: InsertDataOption.INSERT_ROWS,
      valueInputOption: ValueInputOption.RAW,
      range,
      resource,
    });
  }

  #getColumnAlphabet(columnIdx: number): string {
    const ALPHABET_A_ASCII = "A".charCodeAt(0);
    const ALPHABET_Z_ASCII = "Z".charCodeAt(0);

    const cellColumnIdAlphabetASCII = ALPHABET_A_ASCII + columnIdx;
    let cellColumnIdAlphabet = "";
    if (cellColumnIdAlphabetASCII > ALPHABET_Z_ASCII) {
      cellColumnIdAlphabet = `A${String.fromCharCode(
        ALPHABET_A_ASCII + (cellColumnIdAlphabetASCII - ALPHABET_Z_ASCII - 1)
      )}`;
    } else {
      // eslint-disable-next-line no-unused-vars
      cellColumnIdAlphabet = String.fromCharCode(cellColumnIdAlphabetASCII);
    }

    return cellColumnIdAlphabet;
  }

  async getHeaderColumnFromTwoRows(sheetName = "", start = "A1", end = "AZ2"): Promise<HeaderColumn[]> {
    let range = `${start}:${end}`;
    if (sheetName.length > 0) {
      range = `${sheetName}!${range}`;
    }

    const result = await this.#getValueOf(range);
    if (result === undefined) {
      return [];
    }
    const firstRows = result[0];
    const secondRows = result[1];

    const headerColumn: HeaderColumn[] = [];
    for (let idx = 0; idx < firstRows.length; idx++) {
      const secondRowValue = secondRows[idx];

      let prefixLabel = firstRows[idx];
      let colSpan = 1;
      if (secondRowValue !== undefined && secondRowValue.length > 0) {
        if (prefixLabel.length === 0) {
          colSpan = headerColumn[headerColumn.length - 1].colSpan;
          prefixLabel = firstRows[headerColumn.length - colSpan + 1];
        }
        headerColumn.push(
          new HeaderColumn(
            `${prefixLabel.replace("\n", "")}_${secondRowValue}`,
            colSpan + 1,
            this.#getColumnAlphabet(idx)
          )
        );
      } else {
        headerColumn.push(new HeaderColumn(prefixLabel.replace("\n", ""), 1, this.#getColumnAlphabet(idx)));
      }
    }

    return headerColumn;
  }
}
