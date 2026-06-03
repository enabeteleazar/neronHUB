import { useQuery } from "@tanstack/react-query";
import { Terminal } from "lucide-react";
import { DataPanel, EmptyState, JsonBlock, asArray, asRecord } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getConsoleData } from "@/services/neron-api";

export default function ConsolePage() {
  const consoleData = useQuery({ queryKey: ["neron", "console"], queryFn: getConsoleData, refetchInterval: 5000 });
  const actions = asArray(asRecord(consoleData.data?.actions.data)?.items);
  const critic = asArray(asRecord(consoleData.data?.critic.data)?.items);
  const plans = asArray(asRecord(consoleData.data?.planner.data)?.plans);

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto md:grid-cols-3">
        <section className="hud-panel p-4 md:col-span-3">
          <h1 className="flex items-center gap-2 text-sm text-primary"><Terminal size={18} /> Console Neron</h1>
          <p className="mt-2 text-sm text-primary/60">
            Vue terminal basee sur les endpoints historiques officiels. Endpoint logs direct manquant cote Core: /logs ou /events/recent monte.
          </p>
        </section>

        <DataPanel title="Actions" result={consoleData.data?.actions}>
          {actions.length ? <TerminalList items={actions} /> : <EmptyState label="Aucune action recente." />}
        </DataPanel>

        <DataPanel title="Critic" result={consoleData.data?.critic}>
          {critic.length ? <TerminalList items={critic} /> : <EmptyState label="Aucun diagnostic critic recent." />}
        </DataPanel>

        <DataPanel title="Executions Planner" result={consoleData.data?.planner}>
          {plans.length ? <TerminalList items={plans} /> : <EmptyState label="Aucune execution planner recente." />}
        </DataPanel>

        <DataPanel title="Flux brut" result={consoleData.data?.actions} className="md:col-span-3">
          <JsonBlock value={{ actions, critic, plans }} />
        </DataPanel>
      </main>
    </HudLayout>
  );
}

function TerminalList({ items }: { items: unknown[] }) {
  return (
    <div className="max-h-[360px] overflow-auto font-mono text-xs text-primary/80">
      {items.map((item, index) => (
        <div key={index} className="border-b border-primary/10 py-2">
          <span className="text-primary/40">{String(index + 1).padStart(3, "0")} </span>
          {JSON.stringify(item)}
        </div>
      ))}
    </div>
  );
}
