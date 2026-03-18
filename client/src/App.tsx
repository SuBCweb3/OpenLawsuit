import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import Knowledge from "./pages/Knowledge";
import Dashboard from "./pages/Dashboard";
import CaseDetail from "./pages/CaseDetail";
import AiChat from "./pages/AiChat";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/guide"} component={Guide} />
      <Route path={"/knowledge"} component={Knowledge} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/case/:id"} component={CaseDetail} />
      <Route path={"/ai-chat"} component={AiChat} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
