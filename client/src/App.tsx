import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead, StructuredData } from "@/components/SEOHead";

// Pages - Lazy loaded for optimal performance
import { lazy, Suspense } from 'react';

// Critical pages loaded immediately
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";

// All other pages lazy loaded
const QuestionBank = lazy(() => import("@/pages/QuestionBank"));
const Test = lazy(() => import("@/pages/Test"));
const Results = lazy(() => import("@/pages/Results"));
const AirlineInterviews = lazy(() => import("@/pages/AirlineInterviews"));
const AtplViva = lazy(() => import("@/pages/AtplViva"));
const Classes = lazy(() => import("@/pages/Classes"));
const AptitudeTest = lazy(() => import("@/pages/AptitudeTest"));
const Airbus320 = lazy(() => import("@/pages/Airbus320"));
const Syllabus = lazy(() => import("@/pages/Syllabus"));
const PilotResume = lazy(() => import("@/pages/PilotResume"));
const RadioWavesTest = lazy(() => import("@/pages/RadioWavesTest"));
const Subjects = lazy(() => import("@/pages/Subjects"));
const RadioNavigation = lazy(() => import("@/pages/RadioNavigation"));
const ChapterwiseQuestions = lazy(() => import("@/pages/ChapterwiseQuestions"));
const Instruments = lazy(() => import("@/pages/Instruments"));
const OxfordInstruments = lazy(() => import("@/pages/OxfordInstruments"));
const GenericSectionTest = lazy(() => import("@/pages/GenericSectionTest"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead />
      <StructuredData />
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
          <Route path="/subjects/">
            <Suspense fallback={<PageLoader />}>
              <Subjects />
            </Suspense>
          </Route>
          <Route path="/radio-navigation/">
            <Suspense fallback={<PageLoader />}>
              <RadioNavigation />
            </Suspense>
          </Route>
          <Route path="/chapterwise-questions-oxford/">
            <Suspense fallback={<PageLoader />}>
              <ChapterwiseQuestions />
            </Suspense>
          </Route>
          <Route path="/oxford-instruments-questions/">
            <Suspense fallback={<PageLoader />}>
              <OxfordInstruments />
            </Suspense>
          </Route>
          <Route path="/pressure-heads/">
            <Suspense fallback={<PageLoader />}>
              <GenericSectionTest 
                sectionId={7} 
                sectionName="PRESSURE HEADS" 
                backUrl="/oxford-instruments-questions/" 
              />
            </Suspense>
          </Route>
          
          {/* Chapter Routes - Direct MCQ pages */}
          <Route path="/radio-waves/">
            <Suspense fallback={<PageLoader />}>
              <RadioWavesTest />
            </Suspense>
          </Route>
          <Route path="/propagation/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/modulation/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/antennae/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/doppler/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/vdf/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>

          {/* Radio Navigation Options */}
          <Route path="/keith-radio-qb/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/indigo-radio-nav/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>

          {/* Subject Routes - for all ATPL subjects */}
          <Route path="/instruments/">
            <Suspense fallback={<PageLoader />}>
              <Instruments />
            </Suspense>
          </Route>
          <Route path="/performance/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/meteorology/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/technical/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/navigation/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/atpl-question-bank/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/indigo-question-bank/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/keith-williams/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/oxford-all-subjects/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/regulations/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/aircraft-specific/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/mass-and-balance/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/dgca-papers/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/airline-exam-papers/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
          <Route path="/airbus-320/">
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>

          {/* Public pages - accessible to all users */}
          <Route path="/question-bank">
            <Suspense fallback={<PageLoader />}>
              <QuestionBank />
            </Suspense>
          </Route>
          <Route path="/test/:subjectId">
            <Suspense fallback={<PageLoader />}>
              <Test />
            </Suspense>
          </Route>
          <Route path="/results/:sessionId">
            <Suspense fallback={<PageLoader />}>
              <Results />
            </Suspense>
          </Route>
          <Route path="/airline-interviews">
            <Suspense fallback={<PageLoader />}>
              <AirlineInterviews />
            </Suspense>
          </Route>
          <Route path="/atpl-viva">
            <Suspense fallback={<PageLoader />}>
              <AtplViva />
            </Suspense>
          </Route>
          <Route path="/classes">
            <Suspense fallback={<PageLoader />}>
              <Classes />
            </Suspense>
          </Route>
          <Route path="/aptitude-test">
            <Suspense fallback={<PageLoader />}>
              <AptitudeTest />
            </Suspense>
          </Route>
          <Route path="/airbus-320">
            <Suspense fallback={<PageLoader />}>
              <Airbus320 />
            </Suspense>
          </Route>
          <Route path="/syllabus">
            <Suspense fallback={<PageLoader />}>
              <Syllabus />
            </Suspense>
          </Route>
          <Route path="/pilot-resume">
            <Suspense fallback={<PageLoader />}>
              <PilotResume />
            </Suspense>
          </Route>
          
          {/* Legacy route for backward compatibility */}
          <Route path="/test">
            <Suspense fallback={<PageLoader />}>
              <RadioWavesTest />
            </Suspense>
          </Route>

          {/* 404 fallback */}
          <Route>
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </Route>
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
