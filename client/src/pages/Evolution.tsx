import { useQuery } from "@tanstack/react-query";
import { GitPullRequestDraft, ShieldCheck } from "lucide-react";
import { DataPanel, EmptyState, FieldList, JsonBlock, asArray, asRecord } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getEvolutionProposals, getEvolutionRuns, getEvolutionStatus } from "@/services/neron-api";

export default function EvolutionPage() {
  const status = useQuery({ queryKey: ["neron", "evolution", "status"], queryFn: getEvolutionStatus, refetchInterval: 8000 });
  const proposals = useQuery({ queryKey: ["neron", "evolution", "proposals"], queryFn: getEvolutionProposals, refetchInterval: 12000 });
  const runs = useQuery({ queryKey: ["neron", "evolution", "runs"], queryFn: getEvolutionRuns, refetchInterval: 12000 });

  const statusData = asRecord(status.data?.data);
  const proposalList = asArray(asRecord(proposals.data?.data)?.proposals);
  const runList = asArray(asRecord(runs.data?.data)?.runs);

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto md:grid-cols-2">
        <DataPanel title="Cycle actif" result={status.data}>
          <FieldList data={statusData} />
        </DataPanel>

        <DataPanel title="Statuts Codex et validation" result={status.data}>
          <div className="mb-3 flex items-center gap-2 text-primary"><ShieldCheck size={18} /> Superviseur Evolution</div>
          <JsonBlock value={{
            codex: statusData?.codex || statusData?.codex_status || statusData?.runner,
            validation: statusData?.validation || statusData?.validation_status,
            active_run: statusData?.active_run || statusData?.current_run,
          }} />
        </DataPanel>

        <DataPanel title="Propositions" result={proposals.data}>
          <div className="mb-3 flex items-center gap-2 text-primary"><GitPullRequestDraft size={18} /> {proposalList.length} proposition(s)</div>
          {proposalList.length ? <JsonBlock value={proposalList} /> : <EmptyState label="Aucune proposition d'evolution retournee." />}
        </DataPanel>

        <DataPanel title="Historique" result={runs.data}>
          {runList.length ? <JsonBlock value={runList} /> : <EmptyState label="Aucun run d'evolution retourne." />}
        </DataPanel>
      </main>
    </HudLayout>
  );
}
