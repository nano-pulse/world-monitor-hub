import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "./components/AppShell";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <AppShell />
  </TooltipProvider>
);

export default App;
