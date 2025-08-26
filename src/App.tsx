
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobHistory from "./pages/JobHistory";
import Partners from "./pages/Partners";
import PartnerDetail from "./pages/PartnerDetail";
import PartnerMap from "./pages/PartnerMap";
import Driver from "./pages/Driver";
import Settings from "./pages/Settings";
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/job-history" element={<JobHistory />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/partners/:partnerId" element={<PartnerDetail />} />
                <Route path="/partners/:partnerId/map" element={<PartnerMap />} />
                <Route path="/driver" element={<Driver />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/map" element={<Map />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
