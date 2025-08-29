import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CourseDetail from "./pages/CourseDetail";
import CourseGenerator from "./pages/CourseGenerator";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import MockInterview from "./pages/MockInterview";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./context/AuthContext";
import { InterviewProvider } from "./context/InterviewContext";
import Auth from "./pages/Auth";
import CompanyProblems from "./pages/CompanyProblems";
import DSASheet from "./pages/DSASheet";
import DSATopic from "./pages/DSATopic";
import FutureIntegrations from "./pages/FutureIntegrations";
import InterviewResult from "./pages/InterviewResult";
import ProfileBuilder from "./pages/ProfileBuilder";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={
              <Layout>
                <Index />
              </Layout>
            } />
            <Route path="/auth" element={<Auth />} />

            <Route
              path="/dsa-sheet"
              element={
                <Layout>
                  <DSASheet />
                </Layout>
              }
            />
            <Route
              path="/dsa-sheet/topic/:topicId"
              element={
                <Layout>
                  <DSATopic />
                </Layout>
              }
            />
            <Route
              path="/dsa-sheet/company/:companyId"
              element={
                <Layout>
                  <CompanyProblems />
                </Layout>
              }
            />
            <Route
              path="/future-integrations"
              element={
                <Layout>
                  <FutureIntegrations />
                </Layout>
              }
            />
            <Route
              path="/course-generator"
              element={
                <Layout>
                  <CourseGenerator />
                </Layout>
              }
            />
            <Route
              path="/course/:id"
              element={
                <Layout>
                  <CourseDetail />
                </Layout>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <Layout>
                  <InterviewProvider>
                    <MockInterview />
                  </InterviewProvider>
                </Layout>
              }
            />
            <Route
              path="/interview-result/:id"
              element={
                <Layout>
                  <InterviewResult />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/profile-builder"
              element={
                <Layout>
                  <ProfileBuilder />
                </Layout>
              }
            />
            <Route
              path="/resume-analyzer"
              element={
                <Layout>
                  <ResumeAnalyzer />
                </Layout>
              }
            />
            {/* API proxy route for future Flask integration */}
            <Route path="/api/*" element={<div>API Proxy</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
