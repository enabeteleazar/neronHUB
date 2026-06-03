import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, Brain, Cpu, Sparkles, Target } from "lucide-react";
import type React from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { DataPanel, EmptyState, FieldList, JsonBlock, asArray, asRecord, metricNumber } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getJarvisSnapshot } from "@/services/neron-api";

export default function JarvisPage() {
  const snapshot = useQuery({ queryKey: ["neron", "jarvis"], queryFn: getJarvisSnapshot, refetchInterval: 4000 });
  const statusData = snapshot.data?.data;
  const health = statusData?.health;
  const healthCenter = statusData?.healthCenter;
  const selfModelStatus = statusData?.selfModelStatus;
  const selfModelContext = statusData?.selfModelContext;
  const worldModelStatus = statusData?.worldModelStatus;
  const evolutionStatus = statusData?.evolutionStatus;
  const evolutionRuns = statusData?.evolutionRuns;
  const runtimeStatus = statusData?.runtimeStatus;
  const agentsStatus = statusData?.agents;
  const goalsStatus = statusData?.goals;

  const healthContext = asRecord(selfModelContext?.data);
  const runtime = asRecord(healthContext?.runtime);
  const agents = asArray(asRecord(agentsStatus?.data)?.agents);
  const goals = asArray(asRecord(goalsStatus?.data)?.goals);
  const activeGoal = healthContext?.goal || goals[0];

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-3">
          <HudMetric label="CPU" value={metricNumber(runtime, ["cpu_usage", "cpu_percent", "cpu"])} icon={<Cpu size={16} />} />
          <HudMetric label="RAM" value={metricNumber(runtime, ["ram_usage", "memory_usage", "memory_percent", "ram"])} icon={<Activity size={16} />} />
          <DataPanel title="Sante Core" result={health}>
            <FieldList data={asRecord(health?.data)} />
          </DataPanel>

          <DataPanel title="Health Center" result={healthCenter}>
            {healthCenter?.ok ? (
              <FieldList data={asRecord(healthCenter.data)} />
            ) : (
              <div className="text-sm text-primary/60">
                Endpoint Core manquant ou indisponible. Fallback visible via Self Model Context.
              </div>
            )}
          </DataPanel>
        </div>

        <div className="grid gap-4 lg:col-span-6">
          <section className="hud-panel flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6 flex h-48 w-48 items-center justify-center rounded-full border border-primary/40 bg-primary/5 shadow-[0_0_60px_rgba(0,255,255,0.15)]">
              <div className="absolute h-36 w-36 animate-spin rounded-full border border-dashed border-primary/40" />
              <div className="absolute h-24 w-24 rounded-full border border-accent/40" />
              <Sparkles className="text-primary text-glow" size={44} />
            </div>
            <h1 className="text-xl text-primary">JARVIS</h1>
            <p className="mt-2 max-w-xl text-sm text-primary/60">
              Vue temps reel basee sur Health, Self Model, World Model, Goal System, Agents, Runtime, Evolution et LLM via Core.
            </p>
          </section>

          <DataPanel title="Activite cognitive" result={selfModelStatus}>
            <JsonBlock value={{
              self_model_status: selfModelStatus?.data,
              self_model_context: selfModelContext?.data,
              world_model_status: worldModelStatus?.data,
              evolution_status: evolutionStatus?.data,
              evolution_runs: evolutionRuns?.data,
            }} />
          </DataPanel>
        </div>

        <div className="grid gap-4 lg:col-span-3">
          <DataPanel title="Objectifs" result={goalsStatus}>
            <div className="mb-3 flex items-center gap-2 text-primary"><Target size={18} /> Actif</div>
            {activeGoal ? <JsonBlock value={activeGoal} /> : <EmptyState label="Aucun objectif actif." />}
          </DataPanel>

          <DataPanel title="Agents" result={agentsStatus}>
            <div className="mb-3 flex items-center gap-2 text-primary"><Bot size={18} /> {agents.length} agent(s)</div>
            {agents.length ? <JsonBlock value={agents} /> : <EmptyState label="Aucun agent retourne." />}
          </DataPanel>

          <DataPanel title="Runtime" result={runtimeStatus}>
            <FieldList data={asRecord(runtimeStatus?.data)} />
          </DataPanel>
        </div>

        <section className="min-h-[420px] lg:col-span-12">
          <ChatInterface />
        </section>
      </main>
    </HudLayout>
  );
}

function HudMetric({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  const bounded = value === null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="hud-panel p-4">
      <div className="mb-3 flex items-center justify-between text-primary">
        <span className="flex items-center gap-2 font-mono text-xs uppercase">{icon}{label}</span>
        <span className="font-mono text-xl">{value === null ? "N/A" : `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-primary/10">
        <div className="h-full bg-primary" style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}
