
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  BarChart3,
  CheckCircle,
  Clock,
  Navigation,
  Fuel,
  Leaf,
  MapPin,
  Users
} from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);

  // Mock data - in real app, this would come from Supabase
  const job = {
    id: "QF-001",
    name: "Morning Delivery Batch",
    status: "completed" as const,
    objective: "distance" as const,
    solver_mode: "hybrid" as const,
    orders_count: 45,
    partners_count: 8,
    created_at: "2024-01-15T08:30:00Z",
    completed_at: "2024-01-15T08:45:00Z",
    total_distance_km: 287.5,
    total_drive_minutes: 420,
    on_time_pct: 94.2,
    fuel_estimate_ltrs: 23.8,
    co2_kg: 55.2,
    message: "Optimization completed successfully with 12% distance improvement over classical routing"
  };

  const kpiCards = [
    {
      title: "Total Distance",
      value: `${job.total_distance_km}km`,
      icon: Navigation,
      improvement: "-12% vs classical"
    },
    {
      title: "Drive Time",
      value: `${Math.floor(job.total_drive_minutes / 60)}h ${job.total_drive_minutes % 60}m`,
      icon: Clock,
      improvement: "-8% optimization"
    },
    {
      title: "On-Time Rate",
      value: `${job.on_time_pct}%`,
      icon: CheckCircle,
      improvement: "+5% improvement"
    },
    {
      title: "Fuel Saved",
      value: `${job.fuel_estimate_ltrs}L`,
      icon: Fuel,
      improvement: "15L saved"
    },
    {
      title: "CO₂ Reduced",
      value: `${job.co2_kg}kg`,
      icon: Leaf,
      improvement: "35kg reduction"
    },
    {
      title: "Partners Used",
      value: job.partners_count.toString(),
      icon: Users,
      improvement: "Optimal allocation"
    }
  ];

  const routes = [
    {
      partner: "Rahul Kumar",
      vehicle: "bike",
      orders: 6,
      distance: 34.2,
      time: 52,
      stops: ["Restaurant A", "Customer 1", "Restaurant B", "Customer 2", "Restaurant C", "Customer 3"]
    },
    {
      partner: "Priya Singh", 
      vehicle: "scooter",
      orders: 8,
      distance: 41.8,
      time: 63,
      stops: ["Restaurant D", "Customer 4", "Restaurant E", "Customer 5", "Restaurant F", "Customer 6", "Restaurant G", "Customer 7"]
    },
    {
      partner: "Amit Patel",
      vehicle: "car", 
      orders: 5,
      distance: 28.9,
      time: 45,
      stops: ["Restaurant H", "Customer 8", "Restaurant I", "Customer 9", "Restaurant J"]
    }
  ];

  const comparisonData = {
    hybrid: {
      distance: 287.5,
      time: 420,
      cost: 1250,
      on_time: 94.2
    },
    classical: {
      distance: 325.8,
      time: 456,
      cost: 1420,
      on_time: 89.1
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: "bg-success-100 text-success-700 border-success-200",
      running: "bg-primary/20 text-primary border-primary/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30"
    };

    return (
      <Badge className={`status-badge ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {job.name}
              <span className="text-muted-foreground text-xl">#{job.id}</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(job.status)}
              <Badge className="bg-quantum-100 text-quantum-700">
                {job.solver_mode.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                Objective: {job.objective}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {job.status === 'completed' && (
            <>
              <Button 
                variant={isSimulating ? "destructive" : "default"}
                onClick={() => setIsSimulating(!isSimulating)}
                className="gap-2"
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop Simulation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Message */}
      {job.message && (
        <Card className="quantum-card border-success-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-500" />
              <p className="text-success-700">{job.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{kpi.value}</div>
              <p className="text-xs text-success-500">{kpi.improvement}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>Configuration and execution summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Created</span>
                    <p className="font-medium">{new Date(job.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <p className="font-medium">{job.completed_at ? new Date(job.completed_at).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Orders</span>
                    <p className="font-medium">{job.orders_count}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Partners</span>
                    <p className="font-medium">{job.partners_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key optimization results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Distance Optimization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-[88%] h-full bg-success-gradient rounded-full" />
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Efficiency</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-[92%] h-full bg-quantum-gradient rounded-full" />
                      </div>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost Reduction</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-[85%] h-full bg-fleet-gradient rounded-full" />
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compare" className="space-y-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Hybrid vs Classical Comparison
              </CardTitle>
              <CardDescription>Performance comparison between quantum-classical hybrid and pure classical optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Distance (km)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Hybrid</span>
                      <span className="font-medium">{comparisonData.hybrid.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{comparisonData.classical.distance}</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      {((comparisonData.classical.distance - comparisonData.hybrid.distance) / comparisonData.classical.distance * 100).toFixed(1)}% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Time (min)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Hybrid</span>
                      <span className="font-medium">{comparisonData.hybrid.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{comparisonData.classical.time}</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      {((comparisonData.classical.time - comparisonData.hybrid.time) / comparisonData.classical.time * 100).toFixed(1)}% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Cost (₹)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Hybrid</span>
                      <span className="font-medium">{comparisonData.hybrid.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{comparisonData.classical.cost}</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      {((comparisonData.classical.cost - comparisonData.hybrid.cost) / comparisonData.classical.cost * 100).toFixed(1)}% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">On-Time (%)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Hybrid</span>
                      <span className="font-medium">{comparisonData.hybrid.on_time}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{comparisonData.classical.on_time}%</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      +{(comparisonData.hybrid.on_time - comparisonData.classical.on_time).toFixed(1)}% improvement
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routes" className="space-y-4">
          {routes.map((route, index) => (
            <Card key={index} className="quantum-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{route.partner}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`vehicle-badge-${route.vehicle}`}>
                        {route.vehicle}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {route.orders} orders • {route.distance}km • {route.time}min
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MapPin className="w-4 h-4" />
                    View on Map
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Route Sequence:</h4>
                  <div className="flex flex-wrap gap-2">
                    {route.stops.map((stop, stopIndex) => (
                      <Badge key={stopIndex} variant="outline" className="text-xs">
                        {stopIndex + 1}. {stop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="map">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Route Visualization
                {isSimulating && (
                  <Badge className="bg-primary/20 text-primary animate-pulse">
                    Simulation Running
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Interactive map showing optimized routes and real-time simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Interactive Map</p>
                    <p className="text-muted-foreground">Leaflet + OpenFreeMap integration will be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Features: Route polylines, partner markers, delivery points, simulation playback
                    </p>
                  </div>
                  {isSimulating && (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm">Simulation in progress...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetail;
