
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CourseGenerator from "./pages/CourseGenerator";
import MockInterview from "./pages/MockInterview";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import InterviewResult from "./pages/InterviewResult";
import FutureIntegrations from "./pages/FutureIntegrations";
import Auth from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import { InterviewProvider } from "./context/InterviewContext";

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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/future-integrations" element={<Layout><FutureIntegrations /></Layout>} />
            <Route path="/course-generator" element={<Layout><CourseGenerator /></Layout>} />
            <Route path="/course/:id" element={<Layout><CourseDetail /></Layout>} />
            <Route path="/mock-interview" element={
              <Layout>
                <InterviewProvider>
                  <MockInterview />
                </InterviewProvider>
              </Layout>
            } />
            <Route path="/interview-result/:id" element={<Layout><InterviewResult /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
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
