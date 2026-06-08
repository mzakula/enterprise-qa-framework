const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Ensure the test-results directory exists so file transport can write logs
const resultsDir = path.join(__dirname, '..', 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

/**
 * Logger configuration
 * - Minimal enterprise-friendly setup: console + file transport
 * - File transport writes to `test-results/logger.log` so logs survive CI runs
 * - Log level is controlled via `LOG_LEVEL` env var (defaults to 'info')
 * - File rotation is limited via `maxsize`/`maxFiles` to avoid unbounded growth
 *
 * Why this change:
 * - Console-only logging disappears with job logs; file preserves a downloadable artifact.
 * - `test-results/` is already ignored and uploaded as an artifact on failure by CI.
 */
const level = process.env.LOG_LEVEL || 'info';

const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    // Use JSON format for machine-readability in CI artifacts
    format.json()
  ),
  transports: [
    // Console transport remains for local developer experience
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    }),

    // File transport writes persistent logs to test-results/logger.log
    new transports.File({
      filename: path.join(resultsDir, 'logger.log'),
      level,
      // Keep files manageable: rotate by size and keep a few backups
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5
    })
  ]
});

module.exports = logger;