import { google } from "googleapis";

import { ValueInputOption, InsertDataOption } from "./enums/GoogleEnums";

import fs from "fs";
import path from "path";

const apiAuthPath = path.resolve(__dirname, "../config/apiAuth.json");
const apiAuthJson = JSON.parse(fs.readFileSync(apiAuthPath, "utf8"));

const { client_email: clientEmail, private_key: privateKey } = apiAuthJson;

const SHEET_API_URL = "https://www.googleapis.com/auth/spreadsheets";
export class GoogleSheet {
  #sheetApi: any;
  #spreadSheetId: string;

  constructor(spreadSheetId: string) {
    const authorize = new google.auth.JWT(clientEmail, undefined, privateKey, [
      SHEET_API_URL,
    ]);

    this.#sheetApi = google.sheets({
      version: "v4",
      auth: authorize,
    });

    this.#spreadSheetId = spreadSheetId;
  }

  async getValuesOf(
    startCell: string,
    endCell: string,
    sheetId: string = ""
  ): Promise<string[][] | undefined> {
    let range = `${startCell}:${endCell}`;

    if (sheetId.length > 0) {
      range = `${sheetId}!${range}`;
    }

    return await this.#getValueOf(range);
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

  async insertValuesToRow(
    start: string,
    end: string,
    value: any[]
  ): Promise<void> {
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
    const range = `${start}${lastNumber + options.plusNumber}:${end}${
      lastNumber + options.plusNumber
    }`;
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
}
