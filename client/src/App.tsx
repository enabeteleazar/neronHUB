import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CognitivePage from "@/pages/Cognitive";
import ConsolePage from "@/pages/Console";
import EvolutionPage from "@/pages/Evolution";
import GoalsPage from "@/pages/Goals";
import HealthPage from "@/pages/Health";
import JarvisPage from "@/pages/Jarvis";
import RuntimePage from "@/pages/Runtime";

function Router() {
  return (
    <Switch>
      <Route path="/" component={JarvisPage} />
      <Route path="/jarvis" component={JarvisPage} />
      <Route path="/health" component={HealthPage} />
      <Route path="/cognitive" component={CognitivePage} />
      <Route path="/runtime" component={RuntimePage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/evolution" component={EvolutionPage} />
      <Route path="/console" component={ConsolePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
