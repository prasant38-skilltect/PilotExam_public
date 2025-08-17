import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import QuestionBank from "@/pages/QuestionBank";
import Test from "@/pages/Test";
import Results from "@/pages/Results";
import AirlineInterviews from "@/pages/AirlineInterviews";
import AtplViva from "@/pages/AtplViva";
import Classes from "@/pages/Classes";
import AptitudeTest from "@/pages/AptitudeTest";
import Airbus320 from "@/pages/Airbus320";
import Syllabus from "@/pages/Syllabus";
import PilotResume from "@/pages/PilotResume";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {/* Home route - different for authenticated vs guest users */}
          <Route path="/">
            {isLoading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Loading...</p>
                </div>
              </div>
            ) : isAuthenticated ? (
              <Home />
            ) : (
              <Landing />
            )}
          </Route>

          {/* Public pages - accessible to all users */}
          <Route path="/question-bank" component={QuestionBank} />
          <Route path="/test/:subjectId" component={Test} />
          <Route path="/results/:sessionId" component={Results} />
          <Route path="/airline-interviews" component={AirlineInterviews} />
          <Route path="/atpl-viva" component={AtplViva} />
          <Route path="/classes" component={Classes} />
          <Route path="/aptitude-test" component={AptitudeTest} />
          <Route path="/airbus-320" component={Airbus320} />
          <Route path="/syllabus" component={Syllabus} />
          <Route path="/pilot-resume" component={PilotResume} />

          {/* 404 fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
