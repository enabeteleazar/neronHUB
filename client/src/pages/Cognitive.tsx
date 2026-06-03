import { useQuery } from "@tanstack/react-query";
import { Brain, Globe2, Target } from "lucide-react";
import { DataPanel, EmptyState, FieldList, JsonBlock, asRecord } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getGoals, getSelfModel, getWorldModel } from "@/services/neron-api";

export default function CognitivePage() {
  const selfModel = useQuery({ queryKey: ["neron", "self-model"], queryFn: getSelfModel, refetchInterval: 6000 });
  const worldModel = useQuery({ queryKey: ["neron", "world-model"], queryFn: getWorldModel, refetchInterval: 10000 });
  const goals = useQuery({ queryKey: ["neron", "goals", "active"], queryFn: getGoals, refetchInterval: 6000 });

  const selfContext = asRecord(selfModel.data?.context.data);
  const worldStatus = asRecord(worldModel.data?.status.data);
  const activeGoal = asRecord(goals.data?.active.data)?.active_goal;

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto md:grid-cols-2">
        <DataPanel title="Self Model" result={selfModel.data?.status}>
          <div className="mb-3 flex items-center gap-2 text-primary"><Brain size={18} /> Etat cognitif courant</div>
          <FieldList data={asRecord(selfModel.data?.status.data)} />
        </DataPanel>

        <DataPanel title="World Model" result={worldModel.data?.status}>
          <div className="mb-3 flex items-center gap-2 text-primary"><Globe2 size={18} /> Etat du monde connu</div>
          <FieldList data={worldStatus} />
        </DataPanel>

        <DataPanel title="Objectif courant" result={goals.data?.active}>
          <div className="mb-3 flex items-center gap-2 text-primary"><Target size={18} /> Goal System</div>
          {activeGoal ? <JsonBlock value={activeGoal} /> : <EmptyState label="Aucun objectif actif retourne par Core." />}
        </DataPanel>

        <DataPanel title="Contexte courant" result={selfModel.data?.context}>
          <FieldList data={{
            identity: selfContext?.identity,
            summary: selfContext?.summary,
            runtime_mode: asRecord(selfModel.data?.status.data)?.runtime_mode,
            last_activity: selfContext?.last_activity,
          }} />
        </DataPanel>

        <DataPanel title="Diagnostics cognitifs" result={selfModel.data?.context}>
          <JsonBlock value={{
            self_model: selfContext?.diagnostics || [],
            world_model: worldStatus?.diagnostics || [],
            report: asRecord(selfModel.data?.cognitiveReport.data)?.report,
          }} />
        </DataPanel>

        <DataPanel title="Cognitive Core" result={selfModel.data?.cognitiveState}>
          {selfModel.data?.cognitiveState.data ? <JsonBlock value={selfModel.data.cognitiveState.data} /> : <EmptyState />}
        </DataPanel>
      </main>
    </HudLayout>
  );
}
