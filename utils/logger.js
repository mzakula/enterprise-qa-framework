const path = require('path');
const { createLogger, format, transports } = require('winston');
const ensureDir = require('./ensureDir');

const resultsDir = path.join(__dirname, '..', 'test-results');
ensureDir(resultsDir);

/**
 * Logger configuration
 * - Minimal enterprise-friendly setup: console + file transport
 * - File transport writes to `test-results/logger.log` so logs survive CI runs
 * - Log level is controlled via `LOG_LEVEL` env var (defaults to 'info')
 * - File rotation is limited via `maxsize`/`maxFiles` to avoid unbounded growth
 */
const level = process.env.LOG_LEVEL || 'info';

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),

    new transports.File({
      filename: path.join(resultsDir, 'logger.log'),
      level,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5
    })
  ]
});

module.exports = logger;
