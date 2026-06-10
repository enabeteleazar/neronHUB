export type NeronJson = null | boolean | number | string | NeronJson[] | {
  [key: string]: NeronJson;
};

export type NeronRecord = Record<string, NeronJson>;

export type NeronError = {
  endpoint: string;
  message: string;
  status?: number;
  detail?: unknown;
};

export type NeronResult<T = NeronJson> = {
  ok: boolean;
  endpoint: string;
  data: T | null;
  error?: NeronError;
};

export type GoalSubmission = {
  objective: string;
  source?: string;
};

export type NeronAggregatedStatus = {
  ok: boolean;
  coreUrl: string;
  checkedAt: string;
  data: Record<string, NeronResult>;
  missing: string[];
};

const API_PREFIX = "/api/neron";

async function requestNeron<T = NeronJson>(
  endpoint: string,
  init: RequestInit = {},
): Promise<NeronResult<T>> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_PREFIX}${normalizedEndpoint}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return {
        ok: false,
        endpoint: normalizedEndpoint,
        data: null,
        error: {
          endpoint: normalizedEndpoint,
          message: extractErrorMessage(payload) || response.statusText,
          status: response.status,
          detail: payload,
        },
      };
    }

    return {
      ok: true,
      endpoint: normalizedEndpoint,
      data: payload as T,
    };
  } catch (error) {
    return {
      ok: false,
      endpoint: normalizedEndpoint,
      data: null,
      error: {
        endpoint: normalizedEndpoint,
        message: error instanceof Error ? error.message : "Unknown Neron API error",
      },
    };
  }
}

function extractErrorMessage(payload: unknown): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && "message" in payload) {
    return String((payload as { message?: unknown }).message || "");
  }
  if (typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail?: unknown }).detail || "");
  }
  return "";
}

async function bundle<T extends Record<string, Promise<NeronResult>>>(
  requests: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const entries = await Promise.all(
    Object.entries(requests).map(async ([key, promise]) => [key, await promise] as const),
  );
  return Object.fromEntries(entries) as { [K in keyof T]: Awaited<T[K]> };
}

export function getHealth() {
  return requestNeron<NeronRecord>("/health");
}

export async function getNeronStatus(): Promise<NeronAggregatedStatus> {
  const response = await fetch(`${API_PREFIX}/status`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to fetch aggregated Neron status");
  }

  return payload as NeronAggregatedStatus;
}

export function getHealthCenter() {
  return requestNeron<NeronRecord>("/self-model/context");
}

export function getIdentity() {
  return requestNeron<NeronRecord>("/self-model/context");
}

export function getSelfModel() {
  return bundle({
    status: requestNeron<NeronRecord>("/self-model/status"),
    context: requestNeron<NeronRecord>("/self-model/context"),
    cognitiveState: requestNeron<NeronRecord>("/cognitive-core/state"),
    cognitiveReport: requestNeron<NeronRecord>("/cognitive-core/report"),
  });
}

export function getWorldModel() {
  return bundle({
    status: requestNeron<NeronRecord>("/world-model/status"),
    context: requestNeron<NeronRecord>("/world-model/context"),
    summary: requestNeron<NeronRecord>("/world-model/summary"),
  });
}

export function getGoals() {
  return bundle({
    goals: requestNeron<NeronRecord>("/goals"),
    active: requestNeron<NeronRecord>("/goals/active"),
    plannerHistory: requestNeron<NeronRecord>("/planner/history?limit=20"),
  });
}

export function submitGoal(payload: GoalSubmission) {
  return requestNeron<NeronRecord>("/goal", {
    method: "POST",
    body: JSON.stringify({
      goal: payload.objective,
      source: payload.source || "dashboard",
    }),
  });
}

export function getRuntimeStatus() {
  return bundle({
    governor: requestNeron<NeronRecord>("/runtime/governor/policy"),
    tasks: requestNeron<NeronRecord>("/tasks/status"),
    runningTasks: requestNeron<NeronRecord>("/tasks/running"),
    nextTask: requestNeron<NeronRecord>("/tasks/next"),
    planner: requestNeron<NeronRecord>("/planner/status"),
    plannerHistory: requestNeron<NeronRecord>("/planner/history?limit=10"),
  });
}

export function getAgents() {
  return requestNeron<NeronRecord>("/agents");
}

export function getEvolutionStatus() {
  return requestNeron<NeronRecord>("/evolution/status");
}

export function getEvolutionRuns() {
  return requestNeron<NeronRecord>("/evolution/runs?limit=20");
}

export function getEvolutionProposals() {
  return requestNeron<NeronRecord>("/evolution/proposals");
}

export function getLLMStatus() {
  return requestNeron<NeronRecord>("/self-model/context");
}

export function getConsoleData() {
  return bundle({
    actions: requestNeron<NeronRecord>("/actions/history?limit=50"),
    critic: requestNeron<NeronRecord>("/critic/history?limit=50"),
    planner: requestNeron<NeronRecord>("/planner/history?limit=20"),
  });
}

export function sendInputText(text: string) {
  return requestNeron<NeronRecord>("/input/text", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function getJarvisSnapshot() {
  return getNeronStatus();
}
