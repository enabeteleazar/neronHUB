import { useQuery } from "@tanstack/react-query";
import { Cpu, HardDrive, MemoryStick, ServerCog } from "lucide-react";
import type React from "react";
import { DataPanel, EmptyState, FieldList, JsonBlock, asRecord, metricNumber } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getHealth, getHealthCenter } from "@/services/neron-api";

function Gauge({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  const bounded = value === null ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className="hud-panel p-4">
      <div className="mb-3 flex items-center justify-between font-rajdhani text-primary/80">
        <span className="flex items-center gap-2 font-bold uppercase">{icon}{label}</span>
        <span className="font-mono text-xl">{value === null ? "N/A" : `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-primary/10">
        <div className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,255,0.5)]" style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}

export default function HealthPage() {
  const health = useQuery({ queryKey: ["neron", "health"], queryFn: getHealth, refetchInterval: 5000 });
  const healthCenter = useQuery({ queryKey: ["neron", "health-center"], queryFn: getHealthCenter, refetchInterval: 5000 });
  const context = asRecord(healthCenter.data?.data);
  const runtime = asRecord(context?.runtime);
  const healthData = asRecord(context?.health);
  const services = asRecord(context?.services);
  const diagnostics = Array.isArray(context?.diagnostics) ? context.diagnostics : [];
  const recommendations = Array.isArray(context?.recommendations) ? context.recommendations : [];

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto md:grid-cols-12">
        <div className="grid gap-4 md:col-span-4">
          <Gauge label="CPU" value={metricNumber(runtime, ["cpu_usage", "cpu_percent", "cpu"])} icon={<Cpu size={16} />} />
          <Gauge label="RAM" value={metricNumber(runtime, ["ram_usage", "memory_usage", "memory_percent", "ram"])} icon={<MemoryStick size={16} />} />
          <Gauge label="Disque" value={metricNumber(runtime, ["disk_usage", "disk_percent"])} icon={<HardDrive size={16} />} />
        </div>

        <div className="grid gap-4 md:col-span-8">
          <DataPanel title="Etat global" result={health.data}>
            <FieldList data={{ ...asRecord(health.data?.data), ...healthData }} />
          </DataPanel>

          <DataPanel title="Services systemd" result={healthCenter.data}>
            {services ? <FieldList data={services} /> : <EmptyState label="Aucun etat systemd expose par Self Model." />}
          </DataPanel>

          <DataPanel title="Diagnostics" result={healthCenter.data}>
            {diagnostics.length ? <JsonBlock value={diagnostics} /> : <EmptyState label="Aucun diagnostic actif." />}
          </DataPanel>

          <DataPanel title="Recommandations" result={healthCenter.data}>
            {recommendations.length ? <JsonBlock value={recommendations} /> : <EmptyState label="Aucune recommandation active." />}
          </DataPanel>

          <DataPanel title="Source Health Center" result={healthCenter.data}>
            <div className="flex items-center gap-2 text-sm text-primary/70">
              <ServerCog size={16} />
              Donnees lues via /self-model/context. Endpoint Core manquant a creer: /health-center/status.
            </div>
          </DataPanel>
        </div>
      </main>
    </HudLayout>
  );
}
