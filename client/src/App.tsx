import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { WhatsAppChat } from "@/components/WhatsAppChat";
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
import RadioWavesTest from "@/pages/RadioWavesTest";
import Subjects from "@/pages/Subjects";
import RadioNavigation from "@/pages/RadioNavigation";
import ChapterwiseQuestions from "@/pages/ChapterwiseQuestions";
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

          {/* Navigation Flow Routes - SEO-friendly URLs */}
          <Route path="/subjects/" component={Subjects} />
          <Route path="/radio-navigation/chapters/" component={ChapterwiseQuestions} />
          <Route path="/radio-navigation/radio-waves/" component={RadioWavesTest} />
          <Route path="/radio-navigation/" component={RadioNavigation} />

          {/* Other Subject Routes - for future implementation */}
          <Route path="/instruments/" component={NotFound} />
          <Route path="/performance/" component={NotFound} />
          <Route path="/meteorology/" component={NotFound} />
          <Route path="/technical/" component={NotFound} />
          <Route path="/navigation/" component={NotFound} />
          <Route path="/atpl-question-bank/" component={NotFound} />
          <Route path="/indigo-question-bank-6000-jaa-qb/" component={NotFound} />
          <Route path="/keith-williams/" component={NotFound} />
          <Route path="/oxod-all-subjects/" component={NotFound} />
          <Route path="/regulations/" component={NotFound} />
          <Route path="/aircraft-specific/" component={NotFound} />
          <Route path="/mass-and-balance/" component={NotFound} />
          <Route path="/previous-attempt-dgca-papers/" component={NotFound} />
          <Route path="/airline-written-exam-previous-attempt/" component={NotFound} />
          <Route path="/airbus-320/" component={NotFound} />

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
          
          {/* Legacy route for backward compatibility */}
          <Route path="/test" component={RadioWavesTest} />

          {/* 404 fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* WhatsApp Chat Component - Available on all pages */}
      <WhatsAppChat />
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
