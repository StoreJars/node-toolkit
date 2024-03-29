import path from 'path';
import { createLogger, format, transports } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import chalk from 'chalk';

const { combine, colorize, label, printf, splat, timestamp } = format;

const LOGS_DIR = 'logs';

const myFormat = printf((info) => `${info.timestamp} ${chalk.cyan(info.label)} ${info.level}: ${info.message}`);

const loggingWinston = new LoggingWinston();

function logFormat(loggerLabel) {
  return combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    splat(),
    colorize(),
    label({ label: loggerLabel }),
    myFormat,
  );
}

function createLoggerWithLabel(labelName: string) {
  return createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      new transports.Console({
        // timestamp: myFormat,
        level: 'debug',
        // showLevel: true,
        handleExceptions: true,
        // humanReadableUnhandledException: true,
      }),
    ],
    format: logFormat(labelName),
  });
}

export default function (name: string) {
  if (process.env.NODE_ENV == 'production') {
    createLoggerWithLabel(name).add(loggingWinston);
  } else {
    createLoggerWithLabel(name).add(
      new transports.Console({
        format: combine(colorize(), label({ label: name }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
      }),
    );
  }

  return {
    gateway: createLoggerWithLabel(`[${name}:log]`),
    config: createLoggerWithLabel(`[${name}:config]`),
    db: createLoggerWithLabel(`[${name}:db]`),
    admin: createLoggerWithLabel(`[${name}:admin]`),
    email: createLoggerWithLabel(`[${name}:email]`),
  };
}
