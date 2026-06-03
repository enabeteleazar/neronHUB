import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

interface HudLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "JARVIS" },
  { path: "/health", label: "Sante" },
  { path: "/cognitive", label: "Cognitif" },
  { path: "/runtime", label: "Runtime" },
  { path: "/goals", label: "Goals" },
  { path: "/evolution", label: "Evolution" },
  { path: "/console", label: "Console" },
];

export function HudLayout({ children }: HudLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[url('/images/jarvis_hud.jpeg')] bg-cover bg-center bg-no-repeat bg-blend-overlay bg-black/90">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />
      <div className="absolute inset-0 pointer-events-none z-20 opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />

      <div className="relative z-30 flex min-h-screen w-full flex-col p-4 md:p-6">
        <header className="mb-5 flex flex-col gap-4 border-b border-primary/20 pb-4 text-primary/70 md:flex-row md:items-center md:justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <span className="border-l-2 border-primary pl-3 font-orbitron text-sm uppercase tracking-[0.2em]">
              Neron Dashboard
            </span>
            <span className="pl-3 font-mono text-xs text-primary/40">
              Interface officielle via Core REST API
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`rounded border px-3 py-1 font-mono text-xs uppercase transition-colors ${
                  location === item.path
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-primary/20 bg-black/20 text-primary/60 hover:border-primary/50 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        </header>

        {children}

        <footer className="mt-auto flex items-end justify-between pt-6 font-mono text-xs text-primary/40">
          <div className="flex flex-col gap-1">
            <span className="uppercase">Core API: NERON_API_URL</span>
            <span className="uppercase">Mode: affichage et controle</span>
          </div>
          <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="uppercase">
            Source: <span className="text-primary text-glow">Neron Core</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
