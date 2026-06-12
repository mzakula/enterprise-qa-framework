const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// global-setup.js launches a real browser and navigates to a live site. For unit
// testing we replace the heavy external dependencies with lightweight fakes so
// we can validate the setup orchestration logic without network or browser access.

function buildMocks() {
  const calls = [];

  const mockPage = {
    goto: async (url) => calls.push({ method: 'goto', args: [url] }),
    fill: async (sel, val) => calls.push({ method: 'fill', args: [sel, val] }),
    click: async (sel) => calls.push({ method: 'click', args: [sel] }),
    waitForURL: async (pattern) => calls.push({ method: 'waitForURL', args: [pattern] }),
    context: () => ({
      storageState: async ({ path: p }) => {
        calls.push({ method: 'storageState', args: [p] });
        // Write a minimal valid JSON so downstream checks pass
        fs.writeFileSync(p, JSON.stringify({ cookies: [], origins: [] }));
      }
    })
  };

  const mockBrowser = {
    newPage: async () => {
      calls.push({ method: 'newPage' });
      return mockPage;
    },
    close: async () => calls.push({ method: 'browserClose' })
  };

  const mockChromium = {
    launch: async () => {
      calls.push({ method: 'chromiumLaunch' });
      return mockBrowser;
    }
  };

  return { calls, mockChromium, mockBrowser, mockPage };
}

// Helper: load global-setup with mocked playwright chromium
function requireGlobalSetup(mockChromium) {
  const playwrightPath = require.resolve('@playwright/test');
  const originalExports = require(playwrightPath);

  // Temporarily patch the chromium export
  require.cache[playwrightPath] = {
    id: playwrightPath,
    filename: playwrightPath,
    loaded: true,
    exports: { ...originalExports, chromium: mockChromium }
  };

  const gsPath = require.resolve('../../global-setup');
  delete require.cache[gsPath];
  const globalSetup = require('../../global-setup');

  return { globalSetup, gsPath, playwrightPath };
}

test.describe('global-setup', () => {
  const authDir = path.join(__dirname, '..', '..', 'auth');
  const authFile = path.join(authDir, 'auth.json');

  test.afterEach(() => {
    // Clean up auth file written during tests (but keep directory)
    try {
      if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
    } catch { /* ignore */ }
  });

  test('creates auth directory if it does not exist', async () => {
    // Temporarily remove auth dir to verify creation
    const existed = fs.existsSync(authDir);
    if (existed) {
      try { fs.unlinkSync(authFile); } catch { /* ok */ }
      try { fs.rmdirSync(authDir); } catch { /* ok */ }
    }

    const { calls, mockChromium } = buildMocks();
    const { globalSetup, gsPath, playwrightPath } = requireGlobalSetup(mockChromium);

    await globalSetup();

    expect(fs.existsSync(authDir)).toBe(true);

    // Restore cache
    delete require.cache[gsPath];
    delete require.cache[playwrightPath];
  });

  test('launches chromium, performs login, and saves storage state', async () => {
    const { calls, mockChromium } = buildMocks();
    const { globalSetup, gsPath, playwrightPath } = requireGlobalSetup(mockChromium);

    await globalSetup();

    const methods = calls.map((c) => c.method);

    expect(methods).toContain('chromiumLaunch');
    expect(methods).toContain('newPage');
    expect(methods).toContain('goto');
    expect(methods).toContain('fill');
    expect(methods).toContain('click');
    expect(methods).toContain('waitForURL');
    expect(methods).toContain('storageState');
    expect(methods).toContain('browserClose');

    // Restore
    delete require.cache[gsPath];
    delete require.cache[playwrightPath];
  });

  test('uses BASE_URL env var when set', async () => {
    const original = process.env.BASE_URL;
    process.env.BASE_URL = 'https://custom.example.com';

    const { calls, mockChromium } = buildMocks();
    const { globalSetup, gsPath, playwrightPath } = requireGlobalSetup(mockChromium);

    await globalSetup();

    const gotoCall = calls.find((c) => c.method === 'goto');
    expect(gotoCall.args[0]).toBe('https://custom.example.com');

    // Restore
    if (original === undefined) delete process.env.BASE_URL;
    else process.env.BASE_URL = original;
    delete require.cache[gsPath];
    delete require.cache[playwrightPath];
  });

  test('uses default credentials when env vars are not set', async () => {
    const origUser = process.env.TEST_USERNAME;
    const origPass = process.env.TEST_PASSWORD;
    delete process.env.TEST_USERNAME;
    delete process.env.TEST_PASSWORD;

    const { calls, mockChromium } = buildMocks();
    const { globalSetup, gsPath, playwrightPath } = requireGlobalSetup(mockChromium);

    await globalSetup();

    const fillCalls = calls.filter((c) => c.method === 'fill');
    // First fill = username, second fill = password
    expect(fillCalls[0].args[1]).toBe('standard_user');
    expect(fillCalls[1].args[1]).toBe('secret_sauce');

    // Restore
    if (origUser !== undefined) process.env.TEST_USERNAME = origUser;
    if (origPass !== undefined) process.env.TEST_PASSWORD = origPass;
    delete require.cache[gsPath];
    delete require.cache[playwrightPath];
  });

  test('survives launch failure when auth.json already exists', async () => {
    // Pre-create auth file so the catch branch doesn't re-throw
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [] }));

    const failChromium = {
      launch: async () => {
        throw new Error('browser unavailable');
      }
    };

    const { globalSetup, gsPath, playwrightPath } = requireGlobalSetup(failChromium);

    // Should not throw because auth.json exists
    await globalSetup();

    // Restore
    delete require.cache[gsPath];
    delete require.cache[playwrightPath];
  });

  test('throws on launch failure when auth.json does not exist', async () => {
    // Ensure no auth file
    try { fs.unlinkSync(authFile); } catch { /* ok */ }

    const failChromium = {
      launch: async () => {
        throw new Error('browser unavailable');
      }
    };

    const { globalSetup, gsPath, playwrightPath } = requireGlobalSetup(failChromium);

    let threw = false;
    try {
      await globalSetup();
    } catch (err) {
      threw = true;
      expect(err.message).toBe('browser unavailable');
    }
    expect(threw).toBe(true);

    // Restore
    delete require.cache[gsPath];
    delete require.cache[playwrightPath];
  });
});
