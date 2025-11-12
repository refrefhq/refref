import winston from "winston";
const { combine, timestamp, colorize, simple, errors } = winston.format;

const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(),
    simple(),
  ),
  transports: [new winston.transports.Console()],
});

export { logger };
