import type { Express } from "express";
import { createServer, type Server } from "http";

const CORE_ENDPOINTS = {
  health: "/health",
  healthCenter: "/health-center/status",
  selfModelStatus: "/self-model/status",
  selfModelContext: "/self-model/context",
  worldModelStatus: "/world-model/status",
  evolutionStatus: "/evolution/status",
  evolutionRuns: "/evolution/runs",
  runtimeStatus: "/runtime/status",
  agents: "/agents",
  goals: "/goals",
} as const;

type CoreEndpointKey = keyof typeof CORE_ENDPOINTS;

type CoreEndpointResult = {
  endpoint: string;
  ok: boolean;
  status?: number;
  data: unknown;
  error?: {
    endpoint: string;
    message: string;
    status?: number;
  };
};

type NeronStatusResponse = {
  ok: boolean;
  coreUrl: string;
  checkedAt: string;
  data: Record<CoreEndpointKey, CoreEndpointResult>;
  missing: string[];
};

function buildNeronUrl(path: string, query: string): string {
  const neronApiUrl = process.env.NERON_API_URL;
  if (!neronApiUrl) {
    throw new Error("NERON_API_URL is not configured");
  }

  const base = neronApiUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}${query}`;
}

function neronHeaders(hasBody = false): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (process.env.NERON_API_KEY) {
    headers["X-API-Key"] = process.env.NERON_API_KEY;
  }

  return headers;
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

async function fetchCoreEndpoint(endpoint: string): Promise<CoreEndpointResult> {
  try {
    const response = await fetch(buildNeronUrl(endpoint, ""), {
      method: "GET",
      headers: neronHeaders(),
    });
    const payload = await readPayload(response);

    if (!response.ok) {
      return {
        endpoint,
        ok: false,
        status: response.status,
        data: null,
        error: {
          endpoint,
          message: extractError(payload) || response.statusText,
          status: response.status,
        },
      };
    }

    return {
      endpoint,
      ok: true,
      status: response.status,
      data: payload,
    };
  } catch (error) {
    return {
      endpoint,
      ok: false,
      data: null,
      error: {
        endpoint,
        message: error instanceof Error ? error.message : "Neron Core API unavailable",
      },
    };
  }
}

function extractError(payload: unknown): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail?: unknown }).detail || "");
  }
  if (typeof payload === "object" && "message" in payload) {
    return String((payload as { message?: unknown }).message || "");
  }
  return "";
}

export async function getNeronStatus(): Promise<NeronStatusResponse> {
  const entries = await Promise.all(
    Object.entries(CORE_ENDPOINTS).map(async ([key, endpoint]) => {
      const result = await fetchCoreEndpoint(endpoint);
      return [key, result] as const;
    }),
  );
  const data = Object.fromEntries(entries) as Record<CoreEndpointKey, CoreEndpointResult>;
  const missing = Object.values(data)
    .filter((result) => !result.ok)
    .map((result) => result.endpoint);

  return {
    ok: missing.length === 0,
    coreUrl: process.env.NERON_API_URL || "",
    checkedAt: new Date().toISOString(),
    data,
    missing,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/neron/status", async (_req, res) => {
    try {
      res.json(await getNeronStatus());
    } catch (err) {
      res.status(500).json({
        ok: false,
        coreUrl: process.env.NERON_API_URL || "",
        checkedAt: new Date().toISOString(),
        data: {},
        missing: Object.values(CORE_ENDPOINTS),
        message: err instanceof Error ? err.message : "Unable to aggregate Neron status",
      });
    }
  });

  app.all(/^\/api\/neron\/(.*)/, async (req, res) => {
    try {
      const corePath = `/${String(req.params[0] || "")}`;
      const upstreamUrl = buildNeronUrl(corePath, req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "");
      const hasBody = !["GET", "HEAD"].includes(req.method);

      const upstreamResponse = await fetch(upstreamUrl, {
        method: req.method,
        headers: neronHeaders(hasBody && req.is("application/json") !== false),
        body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      });

      const contentType = upstreamResponse.headers.get("content-type") || "";
      const payload = await readPayload(upstreamResponse);

      if (!upstreamResponse.ok) {
        return res.status(upstreamResponse.status).json({
          message: "Neron Core API request failed",
          status: upstreamResponse.status,
          endpoint: corePath,
          detail: payload,
        });
      }

      if (typeof payload === "string") {
        return res.type(contentType || "text/plain").send(payload);
      }
      return res.json(payload);
    } catch (err) {
      console.error("Neron API proxy error:", err);
      res.status(502).json({
        message: err instanceof Error ? err.message : "Neron Core API unavailable",
      });
    }
  });

  return httpServer;
}
