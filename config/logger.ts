import winston, { Logger, format } from "winston";
import winstonDaily from "winston-daily-rotate-file";
import { LOGGER } from "../constans/constants";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});
const logger: Logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: "info",
      datePattern: LOGGER.DATE_PATTERN,
      dirname: LOGGER.DIR_NAME,
      filename: `%DATE%.log`,
      maxFiles: LOGGER.FILE_EXPIRATION_DAYS,
      zippedArchive: true,
    }),
    // warn 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: "warn",
      datePattern: LOGGER.DATE_PATTERN,
      dirname: LOGGER.DIR_NAME + "/" + LOGGER.WARN_DIR_NAME,
      filename: `%DATE%.warn.log`,
      maxFiles: LOGGER.FILE_EXPIRATION_DAYS,
      zippedArchive: true,
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: "error",
      datePattern: LOGGER.DATE_PATTERN,
      dirname: LOGGER.DIR_NAME + "/" + LOGGER.ERROR_DIR_NAME,
      filename: `%DATE%.error.log`,
      maxFiles: LOGGER.FILE_EXPIRATION_DAYS,
      zippedArchive: true,
    }),
  ],
});

export const morganStream = {
  write: (message?: any) => {
    logger.info(message);
  },
};

logger.add(
  new winston.transports.Console({
    format: combine(colorize({ all: true }), logFormat),
  })
);

export default logger;
