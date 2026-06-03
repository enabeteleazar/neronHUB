import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import type React from "react";
import type { NeronJson, NeronResult } from "@/services/neron-api";

export function StatusPill({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-xs font-mono ${
      ok
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-accent/40 bg-accent/10 text-accent"
    }`}>
      {ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      {label}
    </span>
  );
}

export function DataPanel({
  title,
  result,
  children,
  className = "",
}: {
  title: string;
  result?: NeronResult | null;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`hud-panel p-4 min-h-[120px] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-primary/20 pb-2 mb-3">
        <h2 className="text-sm text-primary">{title}</h2>
        {result ? (
          <StatusPill label={result.ok ? result.endpoint : "erreur"} ok={result.ok} />
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-mono text-primary/50">
            <CircleDashed size={14} className="animate-spin" />
            chargement
          </span>
        )}
      </div>
      {result?.error ? <ErrorBlock result={result} /> : children}
    </section>
  );
}

export function ErrorBlock({ result }: { result: NeronResult }) {
  return (
    <div className="rounded border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
      <div className="font-mono text-xs uppercase">{result.endpoint}</div>
      <div>{result.error?.message || "Endpoint indisponible"}</div>
      {result.error?.status ? (
        <div className="mt-1 font-mono text-xs opacity-70">HTTP {result.error.status}</div>
      ) : null}
    </div>
  );
}

export function FieldList({ data }: { data?: Record<string, unknown> | null }) {
  if (!data) return <EmptyState />;

  return (
    <dl className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b border-primary/10 pb-2">
          <dt className="font-mono text-[11px] uppercase text-primary/50">{key}</dt>
          <dd className="break-words text-foreground">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[420px] overflow-auto rounded border border-primary/20 bg-black/30 p-3 text-xs text-primary/80">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function EmptyState({ label = "Aucune donnée retournée." }: { label?: string }) {
  return <div className="text-sm text-primary/50">{label}</div>;
}

export function asRecord(value: NeronJson | unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "non renseigne";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) return `${value.length} element(s)`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function metricNumber(data: Record<string, unknown> | null, keys: string[]): number | null {
  for (const key of keys) {
    const value = data?.[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}
