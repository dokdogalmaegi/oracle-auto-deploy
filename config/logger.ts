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
      filename: `%DATE%.log`, // file 이름 날짜로 저장
      maxFiles: LOGGER.FILE_EXPIRATION_DAYS, // 30일치 로그 파일 저장
      zippedArchive: true,
    }),
    // warn 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: "warn",
      datePattern: LOGGER.DATE_PATTERN,
      dirname: LOGGER.DIR_NAME + "/" + LOGGER.WARN_DIR_NAME,
      filename: `%DATE%.warn.log`, // file 이름 날짜로 저장
      maxFiles: LOGGER.FILE_EXPIRATION_DAYS, // 30일치 로그 파일 저장
      zippedArchive: true,
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: "error",
      datePattern: LOGGER.DATE_PATTERN,
      dirname: LOGGER.DIR_NAME + "/" + LOGGER.ERROR_DIR_NAME, // error.log 파일은 /logs/error 하위에 저장
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
