
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  Navigation, 
  Clock, 
  TrendingUp, 
  Upload,
  Users,
  MapPin,
  BarChart3,
  Zap,
  Fuel,
  Leaf
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  activePartners: number;
  completedJobs: number;
  avgDeliveryTime: number;
  totalDistance: number;
  fuelSaved: number;
  co2Reduced: number;
  onTimeRate: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 1247,
    activePartners: 24,
    completedJobs: 89,
    avgDeliveryTime: 28.5,
    totalDistance: 15420,
    fuelSaved: 234.6,
    co2Reduced: 847.2,
    onTimeRate: 94.3
  });

  const kpiCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      trend: "+12%",
      description: "vs last month",
      color: "quantum"
    },
    {
      title: "Active Partners",
      value: stats.activePartners.toString(),
      icon: Truck,
      trend: "+3",
      description: "online now",
      color: "fleet"
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs.toString(),
      icon: Navigation,
      trend: "+18%",
      description: "this week",
      color: "success"
    },
    {
      title: "Avg Delivery Time",
      value: `${stats.avgDeliveryTime}min`,
      icon: Clock,
      trend: "-8%",
      description: "optimization improvement",
      color: "warning"
    },
    {
      title: "Total Distance",
      value: `${(stats.totalDistance / 1000).toFixed(1)}k km`,
      icon: Navigation,
      trend: "+5%",
      description: "routes optimized",
      color: "quantum"
    },
    {
      title: "Fuel Saved",
      value: `${stats.fuelSaved.toFixed(1)}L`,
      icon: Fuel,
      trend: "+23%",
      description: "vs classical routing",
      color: "success"
    },
    {
      title: "CO₂ Reduced",
      value: `${stats.co2Reduced.toFixed(1)}kg`,
      icon: Leaf,
      trend: "+19%",
      description: "environmental impact",
      color: "success"
    },
    {
      title: "On-Time Rate",
      value: `${stats.onTimeRate}%`,
      icon: TrendingUp,
      trend: "+2.1%",
      description: "quantum optimization",
      color: "fleet"
    }
  ];

  const quickActions = [
    {
      title: "Upload Orders",
      description: "Import Excel/CSV with AI parsing",
      icon: Upload,
      href: "/upload",
      color: "quantum-gradient"
    },
    {
      title: "Manage Partners",
      description: "View and manage delivery team",
      icon: Users,
      href: "/partners",
      color: "fleet-gradient"
    },
    {
      title: "Live Map",
      description: "Track deliveries in real-time",
      icon: MapPin,
      href: "/map",
      color: "success-gradient"
    },
    {
      title: "Create Job",
      description: "Start new optimization job",
      icon: BarChart3,
      href: "/jobs/new",
      color: "quantum-gradient"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-quantum-gradient rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your fleet optimization performance and key metrics
          </p>
        </div>
        <Badge variant="secondary" className="bg-success-100 text-success-700 border-success-200">
          <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse" />
          System Operational
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Card key={index} className="partner-card group overflow-hidden relative">
            <div className={`absolute inset-0 opacity-5 ${action.color}`} />
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <Button className="w-full quantum-gradient text-white hover:opacity-90">
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Jobs
            </CardTitle>
            <CardDescription>Latest optimization jobs and their status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "QF-001", status: "completed", orders: 45, time: "2h 34m ago" },
              { id: "QF-002", status: "running", orders: 32, time: "Running" },
              { id: "QF-003", status: "completed", orders: 28, time: "5h 12m ago" }
            ].map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={job.status === 'completed' ? 'default' : 'secondary'}
                    className={job.status === 'completed' ? 'bg-success-100 text-success-700' : ''}
                  >
                    {job.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{job.id}</p>
                    <p className="text-sm text-muted-foreground">{job.orders} orders</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{job.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="quantum-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Partners
            </CardTitle>
            <CardDescription>Currently online delivery partners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Rahul Kumar", vehicle: "bike", status: "delivering", eta: "15 min" },
              { name: "Priya Singh", vehicle: "scooter", status: "available", eta: "Ready" },
              { name: "Amit Patel", vehicle: "car", status: "en_route", eta: "8 min" }
            ].map((partner, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-quantum-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {partner.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`vehicle-badge-${partner.vehicle}`}>
                        {partner.vehicle}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{partner.eta}</p>
                  <Badge 
                    variant="outline" 
                    className={`status-badge-${partner.status.replace('_', '-')}`}
                  >
                    {partner.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
