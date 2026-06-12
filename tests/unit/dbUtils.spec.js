const { test, expect } = require('@playwright/test');

// Build lightweight mock before loading dbUtils so the module picks up the fake Pool.
// Each test.describe gets a fresh mock to prevent cross-test leakage.

function createMockPool() {
  const calls = [];
  const mockClient = {
    release: () => calls.push({ method: 'release' })
  };
  return {
    calls,
    mockClient,
    connect: async () => {
      calls.push({ method: 'connect' });
      return mockClient;
    },
    query: async (query, params) => {
      calls.push({ method: 'query', args: [query, params] });
      return { rows: [{ id: 1, name: 'mock' }] };
    },
    end: async () => {
      calls.push({ method: 'end' });
    }
  };
}

let mockPool;

test.describe('database/dbUtils', () => {
  let dbUtils;
  let dbUtilsPath;

  test.beforeAll(() => {
    mockPool = createMockPool();

    // Inject mock pg module before requiring dbUtils
    const pgPath = require.resolve('pg');
    require.cache[pgPath] = {
      id: pgPath,
      filename: pgPath,
      loaded: true,
      exports: {
        Pool: function PoolMock() {
          return mockPool;
        }
      }
    };

    // Clear any prior cached dbUtils
    dbUtilsPath = require.resolve('../../database/dbUtils');
    delete require.cache[dbUtilsPath];

    dbUtils = require('../../database/dbUtils');
  });

  test.afterAll(() => {
    // Clean up require cache
    delete require.cache[dbUtilsPath];
    delete require.cache[require.resolve('pg')];
  });

  test('exports connectDB, executeQuery, closeDB functions', () => {
    expect(typeof dbUtils.connectDB).toBe('function');
    expect(typeof dbUtils.executeQuery).toBe('function');
    expect(typeof dbUtils.closeDB).toBe('function');
  });

  test('connectDB acquires and releases a client from the pool', async () => {
    mockPool.calls.length = 0;
    await dbUtils.connectDB();

    const methods = mockPool.calls.map((c) => c.method);
    expect(methods).toContain('connect');
    expect(methods).toContain('release');
  });

  test('executeQuery sends query and params to pool.query', async () => {
    mockPool.calls.length = 0;
    const rows = await dbUtils.executeQuery('SELECT * FROM products WHERE id = $1', [42]);

    const queryCall = mockPool.calls.find((c) => c.method === 'query');
    expect(queryCall).toBeDefined();
    expect(queryCall.args[0]).toBe('SELECT * FROM products WHERE id = $1');
    expect(queryCall.args[1]).toEqual([42]);
    expect(rows).toEqual([{ id: 1, name: 'mock' }]);
  });

  test('executeQuery defaults params to empty array', async () => {
    mockPool.calls.length = 0;
    await dbUtils.executeQuery('SELECT 1');

    const queryCall = mockPool.calls.find((c) => c.method === 'query');
    expect(queryCall.args[1]).toEqual([]);
  });

  test('closeDB calls pool.end()', async () => {
    mockPool.calls.length = 0;
    await dbUtils.closeDB();

    const methods = mockPool.calls.map((c) => c.method);
    expect(methods).toContain('end');
  });

  test('closeDB swallows errors from pool.end()', async () => {
    // Temporarily make end() throw
    const originalEnd = mockPool.end;
    mockPool.end = async () => {
      throw new Error('connection already closed');
    };

    // Should not throw
    await dbUtils.closeDB();

    mockPool.end = originalEnd;
  });
});
