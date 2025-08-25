import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  Users, 
  MapPin, 
  BarChart3, 
  Zap, 
  Clock, 
  TrendingUp,
  Package,
  Truck,
  Navigation,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalOrders: number;
  activePartners: number;
  completedJobs: number;
  avgDeliveryTime: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activePartners: 0,
    completedJobs: 0,
    avgDeliveryTime: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // For now, we'll use mock data until we have the full implementation
      // In a real app, these would be actual Supabase queries
      setStats({
        totalOrders: 1247,
        activePartners: 24,
        completedJobs: 89,
        avgDeliveryTime: 28.5
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadOrders = () => {
    navigate('/upload');
  };

  const handleViewAnalytics = () => {
    navigate('/dashboard');
  };

  const handleQuickAction = (href: string) => {
    navigate(href);
  };

  const quickActions = [
    {
      title: "Upload Orders",
      description: "Import Excel/CSV with AI parsing",
      icon: Upload,
      href: "/upload",
      color: "quantum"
    },
    {
      title: "Manage Partners",
      description: "View and manage delivery team",
      icon: Users,
      href: "/partners",
      color: "fleet"
    },
    {
      title: "Live Map",
      description: "Track deliveries in real-time",
      icon: MapPin,
      href: "/map",
      color: "success"
    },
    {
      title: "Optimization Jobs",
      description: "Create and monitor route optimization",
      icon: BarChart3,
      href: "/jobs",
      color: "warning"
    }
  ];

  const kpiCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      trend: "+12%",
      description: "vs last month"
    },
    {
      title: "Active Partners",
      value: stats.activePartners.toString(),
      icon: Truck,
      trend: "+3",
      description: "online now"
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs.toString(),
      icon: Navigation,
      trend: "+18%",
      description: "this week"
    },
    {
      title: "Avg Delivery Time",
      value: `${stats.avgDeliveryTime}min`,
      icon: Clock,
      trend: "-8%",
      description: "optimization improvement"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-quantum-pulse">
            <Sparkles className="w-12 h-12 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading Quantum Fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="quantum-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Quantum-Powered Fleet Optimization
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Quantum Fleet
              <span className="block text-fleet-200">Optimization</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Revolutionary AI-powered dispatch system combining quantum computing with classical optimization for unparalleled route efficiency.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={handleUploadOrders}>
                <Upload className="w-5 h-5 mr-2" />
                Upload Orders
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleViewAnalytics}>
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-quantum-pulse" />
        <div className="absolute bottom-20 right-40 w-16 h-16 bg-fleet-400/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-60 w-8 h-8 bg-success-400/30 rounded-full animate-ping" />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="kpi-card group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1 text-success-500" />
                  <span className="text-success-500 font-medium">{kpi.trend}</span>
                  <span className="ml-1">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with powerful fleet management tools powered by quantum optimization algorithms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="partner-card group">
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full" variant="outline" onClick={() => handleQuickAction(action.href)}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="quantum-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-quantum-gradient">
              Quantum-Powered Features
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of fleet optimization with AI-driven Excel parsing, 
              hybrid quantum-classical algorithms, and real-time execution simulation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-quantum-100 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-quantum-600" />
              </div>
              <h3 className="text-xl font-semibold">AI Excel Parsing</h3>
              <p className="text-muted-foreground">
                Intelligent data extraction and validation using OpenRouter LLM integration.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-fleet-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-fleet-600" />
              </div>
              <h3 className="text-xl font-semibold">Hybrid Optimization</h3>
              <p className="text-muted-foreground">
                Quantum QAOA algorithms with classical OR-Tools fallback for optimal routes.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                <Navigation className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Simulation</h3>
              <p className="text-muted-foreground">
                Live delivery tracking and execution simulation without GPS dependency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
