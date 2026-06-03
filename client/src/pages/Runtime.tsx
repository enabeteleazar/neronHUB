import { useQuery } from "@tanstack/react-query";
import { Bot, Clock3, ListChecks } from "lucide-react";
import { DataPanel, EmptyState, FieldList, JsonBlock, asArray, asRecord } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getAgents, getRuntimeStatus } from "@/services/neron-api";

export default function RuntimePage() {
  const runtime = useQuery({ queryKey: ["neron", "runtime"], queryFn: getRuntimeStatus, refetchInterval: 5000 });
  const agents = useQuery({ queryKey: ["neron", "agents"], queryFn: getAgents, refetchInterval: 8000 });

  const agentData = asRecord(agents.data?.data);
  const agentList = asArray(agentData?.agents);
  const taskStatus = asRecord(runtime.data?.tasks.data);
  const runningTasks = asArray(asRecord(runtime.data?.runningTasks.data)?.tasks);
  const plans = asArray(asRecord(runtime.data?.plannerHistory.data)?.plans);

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto md:grid-cols-12">
        <div className="grid gap-4 md:col-span-4">
          <DataPanel title="Agents actifs" result={agents.data}>
            <div className="mb-3 flex items-center gap-2 text-primary"><Bot size={18} /> {agentList.length} agent(s)</div>
            {agentList.length ? <JsonBlock value={agentList} /> : <EmptyState label="Aucun agent runtime retourne." />}
          </DataPanel>

          <DataPanel title="Taches en attente" result={runtime.data?.tasks}>
            <FieldList data={taskStatus} />
          </DataPanel>
        </div>

        <div className="grid gap-4 md:col-span-8">
          <DataPanel title="Runtime Governor" result={runtime.data?.governor}>
            <FieldList data={asRecord(runtime.data?.governor.data)} />
          </DataPanel>

          <DataPanel title="Taches en cours" result={runtime.data?.runningTasks}>
            <div className="mb-3 flex items-center gap-2 text-primary"><ListChecks size={18} /> Execution active</div>
            {runningTasks.length ? <JsonBlock value={runningTasks} /> : <EmptyState label="Aucune tache en cours." />}
          </DataPanel>

          <DataPanel title="Prochaine tache" result={runtime.data?.nextTask}>
            <JsonBlock value={runtime.data?.nextTask.data} />
          </DataPanel>

          <DataPanel title="Evenements recents" result={runtime.data?.plannerHistory}>
            <div className="mb-3 flex items-center gap-2 text-primary"><Clock3 size={18} /> Historique planner recent</div>
            {plans.length ? <JsonBlock value={plans} /> : <EmptyState label="Aucun evenement runtime officiel expose. Endpoint Core manquant: /events/recent inclus dans le code mais non monte dans core/app.py." />}
          </DataPanel>
        </div>
      </main>
    </HudLayout>
  );
}
