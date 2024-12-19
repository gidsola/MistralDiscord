import winston from 'winston';
import chalk from 'chalk';

const
  { combine, timestamp, label, printf } = winston.format,
  /** @type {{ [key: string]: chalk.Chalk }} */
  levelColors = {
    info: chalk.rgb(51, 153, 255),
    warn: chalk.rgb(255, 255, 102),
    error: chalk.bgRedBright.whiteBright
  },
  myFormat = printf(({ level, message, label, timestamp }) => {
    const colorize = levelColors[level] || ((/** @type {any} */text) => text);
    return `${chalk.blue(timestamp)} [${chalk.magenta(label)}] ${colorize(level)}: ${chalk.rgb(204, 51, 153)(message)}`;
  }),
  logger = winston.createLogger({
    level: 'info',
    format: combine(
      label({ label: '@goodsie' }),
      timestamp(),
      myFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/warnings.log', level: 'warn' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]
  });
export default logger;
