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
const RadioWavesTest = lazy(() => import("@/pages/RadioWavesTest"));
const Subjects = lazy(() => import("@/pages/Subjects"));
const DynamicPage = lazy(() => import("@/pages/DynamicPage"));
const Instruments = lazy(() => import("@/pages/Instruments"));
const GenericSectionTest = lazy(() => import("@/pages/GenericSectionTest"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
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
          {/* <Route path="/pressure-heads/">
            <Suspense fallback={<PageLoader />}>
              <GenericSectionTest 
                sectionId={7} 
                sectionName="PRESSURE HEADS" 
                backUrl="/oxford-instruments-questions/" 
              />
            </Suspense>
          </Route> */}
          
          {/* Chapter Routes - Direct MCQ pages */}
          {/* <Route path="/radio-waves/">
            <Suspense fallback={<PageLoader />}>
              <RadioWavesTest />
            </Suspense>
          </Route> */}
          

          {/* Radio Navigation Options */}
          {/* <Route path="/instruments/">
            <Suspense fallback={<PageLoader />}>
              <Instruments />
            </Suspense>
          </Route> */}
          

          {/* Authentication Pages */}
          <Route path="/sign-in">
            <Suspense fallback={<PageLoader />}>
              <SignIn />
            </Suspense>
          </Route>
          <Route path="/sign-up">
            <Suspense fallback={<PageLoader />}>
              <SignUp />
            </Suspense>
          </Route>
          <Route path="/forgot-password">
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          </Route>

          {/* Public pages - accessible to all users */}
          {/* <Route path="/question-bank">
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
          </Route> */} 
          <Route path="*">
            <Suspense fallback={<PageLoader />}>
              <DynamicPage />
            </Suspense>
          </Route>
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
