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
import { useLocation } from "wouter";
import { useEffect } from "react";

// Pages - Lazy loaded for optimal performance
import { lazy, Suspense } from 'react';

// Critical pages loaded immediately
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";

// All other pages lazy loaded
const Subjects = lazy(() => import("@/pages/Subjects"));
const DynamicPage = lazy(() => import("@/pages/DynamicPage"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const ManageProfile = lazy(() => import("@/pages/ManageProfile"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Admin = lazy(() => import("@/pages/Admin"));
const Progress = lazy(() => import("@/pages/Progress"));
const AirSpeedIndicator = lazy(() => import("@/pages/AirSpeedIndicator"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));

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
  const [, setLocation] = useLocation();

  // Handle post-authentication redirect
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectPath = localStorage.getItem("redirectAfterLogin");
      if (redirectPath && redirectPath !== "/") {
        localStorage.removeItem("redirectAfterLogin");
        setLocation(redirectPath);
      }
    }
  }, [isAuthenticated, isLoading, setLocation]);

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
          <Route path="/manage-profile">
            <Suspense fallback={<PageLoader />}>
              <ManageProfile />
            </Suspense>
          </Route>
          <Route path="/admin">
            <Suspense fallback={<PageLoader />}>
              <Admin />
            </Suspense>
          </Route>
          <Route path="/progress">
            <Suspense fallback={<PageLoader />}>
              <Progress />
            </Suspense>
          </Route>
          <Route path="/subscriptions">
            <Suspense fallback={<PageLoader />}>
              <Subscriptions />
            </Suspense>
          </Route>

          {/* Pilot Aptitude Test Route */}
          <Route path="/air-speed-indicator">
            <Suspense fallback={<PageLoader />}>
              <AirSpeedIndicator />
            </Suspense>
          </Route>

           <Route path="/question-banks">
            <Suspense fallback={<PageLoader />}>
              <Subjects showBackToHome = {false} />
            </Suspense>
          </Route>

          <Route path="/test/earth-atmosphere/*">
            {() => {
              window.location.replace("/test/earth-atmosphere/index.html");
              return null;
            }}
          </Route>
          <Route path="/test/jet_engine_animation/*">
            {() => {
              window.location.replace("/test/jet_engine_animation/index.html");
              return null;
            }}
          </Route>

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
