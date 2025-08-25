
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // Don't show sidebar on home page
  if (isHomePage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <SidebarTrigger className="ml-2" />
            <div className="ml-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-quantum-gradient rounded" />
              <span className="font-semibold text-quantum-gradient">Quantum Fleet</span>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default Layout;
