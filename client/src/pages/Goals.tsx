import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Target } from "lucide-react";
import { DataPanel, EmptyState, JsonBlock, asArray, asRecord } from "@/components/NeronData";
import { HudLayout } from "@/components/HudLayout";
import { getGoals, submitGoal } from "@/services/neron-api";

export default function GoalsPage() {
  const [objective, setObjective] = useState("");
  const queryClient = useQueryClient();
  const goals = useQuery({ queryKey: ["neron", "goals"], queryFn: getGoals, refetchInterval: 6000 });
  const submit = useMutation({
    mutationFn: submitGoal,
    onSuccess: () => {
      setObjective("");
      queryClient.invalidateQueries({ queryKey: ["neron", "goals"] });
    },
  });

  const goalList = asArray(asRecord(goals.data?.goals.data)?.goals);
  const plans = asArray(asRecord(goals.data?.plannerHistory.data)?.plans);

  return (
    <HudLayout>
      <main className="grid flex-1 gap-4 overflow-auto md:grid-cols-12">
        <section className="hud-panel p-4 md:col-span-12">
          <h1 className="mb-3 text-sm text-primary">Soumettre un objectif</h1>
          <form
            className="flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (objective.trim()) submit.mutate({ objective: objective.trim() });
            }}
          >
            <input
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              className="flex-1 border border-primary/30 bg-black/40 px-3 py-2 font-mono text-primary outline-none focus:border-primary"
              placeholder="/goal texte"
              disabled={submit.isPending}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-primary disabled:opacity-50"
              disabled={!objective.trim() || submit.isPending}
            >
              <Send size={16} />
              Envoyer
            </button>
          </form>
          {submit.data?.error ? <div className="mt-3 text-sm text-accent">{submit.data.error.message}</div> : null}
        </section>

        <DataPanel title="Objectifs" result={goals.data?.goals} className="md:col-span-6">
          <div className="mb-3 flex items-center gap-2 text-primary"><Target size={18} /> {goalList.length} objectif(s)</div>
          {goalList.length ? <JsonBlock value={goalList} /> : <EmptyState label="Aucun objectif retourne par Core." />}
        </DataPanel>

        <DataPanel title="Objectif actif" result={goals.data?.active}>
          <JsonBlock value={asRecord(goals.data?.active.data)?.active_goal || null} />
        </DataPanel>

        <DataPanel title="Historique et progression" result={goals.data?.plannerHistory}>
          {plans.length ? <JsonBlock value={plans} /> : <EmptyState label="Aucun historique planner retourne." />}
        </DataPanel>

        <DataPanel title="Derniere soumission" result={submit.data || null}>
          {submit.data?.data ? <JsonBlock value={submit.data.data} /> : <EmptyState label="Aucune soumission durant cette session." />}
        </DataPanel>
      </main>
    </HudLayout>
  );
}
