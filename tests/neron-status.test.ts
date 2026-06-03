import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { getNeronStatus, registerRoutes } from "../server/routes";

const originalFetch = globalThis.fetch;
const originalNeronApiUrl = process.env.NERON_API_URL;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalNeronApiUrl === undefined) {
    delete process.env.NERON_API_URL;
  } else {
    process.env.NERON_API_URL = originalNeronApiUrl;
  }
});

test("getNeronStatus uses NERON_API_URL for Core requests", async () => {
  const requestedUrls: string[] = [];
  process.env.NERON_API_URL = "http://neron-core.test:8010";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrls.push(String(input));
    return jsonResponse({ status: "ok" });
  }) as typeof fetch;

  const status = await getNeronStatus();

  assert.equal(status.coreUrl, "http://neron-core.test:8010");
  assert.equal(status.data.health.endpoint, "/health");
  assert.ok(requestedUrls.length > 0);
  assert.ok(requestedUrls.every((url) => url.startsWith("http://neron-core.test:8010/")));
});

test("GET /api/neron/status returns structured endpoint results", async () => {
  process.env.NERON_API_URL = "http://localhost:8010";
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/health-center/status") || url.endsWith("/runtime/status")) {
      return jsonResponse({ detail: "Not Found" }, 404);
    }
    return jsonResponse({ endpoint: new URL(url).pathname });
  }) as typeof fetch;

  const routes = new Map<string, Function>();
  const app = {
    get(path: string, handler: Function) {
      routes.set(`GET ${path}`, handler);
    },
    all() {
      return undefined;
    },
  };

  await registerRoutes({} as never, app as never);
  const handler = routes.get("GET /api/neron/status");
  assert.equal(typeof handler, "function");

  let statusCode = 200;
  let payload: any = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: unknown) {
      payload = body;
      return this;
    },
  };

  await handler?.({}, res);

  assert.equal(statusCode, 200);
  assert.equal(payload.coreUrl, "http://localhost:8010");
  assert.equal(payload.data.health.ok, true);
  assert.equal(payload.data.selfModelStatus.endpoint, "/self-model/status");
  assert.equal(payload.data.healthCenter.ok, false);
  assert.ok(payload.missing.includes("/health-center/status"));
  assert.ok(payload.missing.includes("/runtime/status"));
});

test("Neron dashboard code does not use random or Ollama data sources", () => {
  const files = [
    "server/routes.ts",
    "client/src/services/neron-api.ts",
    "client/src/pages/Jarvis.tsx",
    "client/src/pages/Health.tsx",
    "client/src/components/MetricsPanel.tsx",
    "client/src/components/ui/sidebar.tsx",
  ];

  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    assert.equal(source.includes("Math.random"), false, `${file} still uses Math.random`);
    assert.equal(source.includes("OLLAMA"), false, `${file} still references OLLAMA`);
    assert.equal(source.includes("Ollama"), false, `${file} still references Ollama`);
  }
});

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}
