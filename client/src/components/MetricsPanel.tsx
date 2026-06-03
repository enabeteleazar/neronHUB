import { motion } from "framer-motion";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { metricNumber } from "@/components/NeronData";

interface MetricsPanelProps {
  runtime?: Record<string, unknown> | null;
}

export function MetricsPanel({ runtime }: MetricsPanelProps) {
  const metrics = [
    { label: "PROCESSOR", value: metricNumber(runtime || null, ["cpu_usage", "cpu_percent", "cpu"]), icon: <Cpu size={16} /> },
    { label: "MEMORY", value: metricNumber(runtime || null, ["ram_usage", "memory_usage", "memory_percent", "ram"]), icon: <MemoryStick size={16} /> },
    { label: "DISK", value: metricNumber(runtime || null, ["disk_usage", "disk_percent"]), icon: <HardDrive size={16} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col gap-4"
    >
      <div className="mb-2 border-b border-primary/30 pb-2 font-orbitron text-lg tracking-wider text-primary">
        SYSTEM DIAGNOSTICS
      </div>

      {metrics.map((metric) => {
        const bounded = metric.value === null ? 0 : Math.max(0, Math.min(100, metric.value));
        return (
          <div key={metric.label} className="hud-panel flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between font-rajdhani font-bold text-primary/80">
              <span className="flex items-center gap-2">{metric.icon} {metric.label}</span>
              <span className="text-xl">{metric.value === null ? "N/A" : `${metric.value}%`}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                style={{ width: `${bounded}%` }}
              />
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
