import path from "path";
import fs from "fs";

const apiAuthPath = path.resolve(__dirname, "../config/apiAuth.json");
const apiAuthJson = JSON.parse(fs.readFileSync(apiAuthPath, "utf8"));
const { client_email: clientEmail, private_key: privateKey } = apiAuthJson;

export const GOOGLE_SHEET = {
  SHEET_API_URL: "https://www.googleapis.com/auth/spreadsheets",
  CLIENT_EMAIL: clientEmail,
  PRIVATE_KEY: privateKey,
  NUMBER_MATCHER: RegExp(/(\d+)$/),
};

export const LOGGER = {
  DIR_NAME: "logs",
  ERROR_DIR_NAME: "error",
  WARN_DIR_NAME: "warn",
  DATE_PATTERN: "YYYY-MM-DD",
  FILE_EXPIRATION_DAYS: "90",
};

export const ORACLE = {
  CONNECTION_TIMEOUT_SECONDS: 10,
};
