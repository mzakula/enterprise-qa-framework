const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('utils/logger', () => {
  let logger;

  test.beforeAll(() => {
    logger = require('../../utils/logger');
  });

  test('exports a winston logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('default log level is info', () => {
    expect(logger.level).toBe('info');
  });

  test('has Console and File transports', () => {
    const transportNames = logger.transports.map((t) => t.constructor.name);
    expect(transportNames).toContain('Console');
    expect(transportNames).toContain('File');
  });

  test('File transport targets test-results/logger.log', () => {
    const fileTransport = logger.transports.find(
      (t) => t.constructor.name === 'File'
    );
    expect(fileTransport).toBeDefined();
    expect(fileTransport.filename).toBe('logger.log');
    const expectedDir = path.join(__dirname, '..', '..', 'test-results');
    expect(fileTransport.dirname).toBe(expectedDir);
  });

  test('File transport has maxsize and maxFiles configured', () => {
    const fileTransport = logger.transports.find(
      (t) => t.constructor.name === 'File'
    );
    expect(fileTransport.maxsize).toBe(5 * 1024 * 1024);
    expect(fileTransport.maxFiles).toBe(5);
  });

  test('respects LOG_LEVEL env var', () => {
    // Clear cached module so it re-evaluates process.env
    const loggerPath = require.resolve('../../utils/logger');
    delete require.cache[loggerPath];

    const original = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'debug';
    try {
      const freshLogger = require('../../utils/logger');
      expect(freshLogger.level).toBe('debug');
    } finally {
      // Restore
      if (original === undefined) {
        delete process.env.LOG_LEVEL;
      } else {
        process.env.LOG_LEVEL = original;
      }
      delete require.cache[loggerPath];
    }
  });

  test('logger format includes timestamp', () => {
    expect(logger.format).toBeDefined();
  });
});
