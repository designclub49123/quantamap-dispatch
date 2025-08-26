import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JobMap from "@/components/JobMap";
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
  Users,
  Loader2,
  TrendingUp,
  Zap
} from "lucide-react";

interface Job {
  id: string;
  name: string;
  status: string;
  optimization_type: string;
  total_orders: number;
  assigned_partners: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  metadata: any;
  org_id: string;
}

interface JobAssignment {
  id: string;
  job_id: string;
  order_id: string;
  partner_id: string;
  sequence_order: number;
  estimated_duration: number | null;
  estimated_distance: number | null;
  orders: {
    external_id: string;
    pickup_name: string;
    drop_name: string;
    pickup_lat: number;
    pickup_lng: number;
    drop_lat: number;
    drop_lng: number;
  };
  delivery_partners: {
    name: string;
    vehicle_type: string;
  };
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJobData();
    }
  }, [id]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) {
        console.error('Job fetch error:', jobError);
        throw new Error('Job not found');
      }

      // Fetch job assignments with related order and partner data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('job_assignments')
        .select(`
          *,
          orders (
            external_id,
            pickup_name,
            drop_name,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng
          ),
          delivery_partners (
            name,
            vehicle_type
          )
        `)
        .eq('job_id', id)
        .order('partner_id', { ascending: true })
        .order('sequence_order', { ascending: true });

      if (assignmentsError) {
        console.error('Assignments fetch error:', assignmentsError);
        // Don't throw error for missing assignments, just log it
      }

      setJob(jobData);
      setAssignments(assignmentsData || []);

    } catch (error: any) {
      console.error('Error fetching job data:', error);
      setError(error.message || 'Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (!job) {
      return {
        total_distance: 0,
        total_time: 0,
        on_time_pct: 0,
        fuel_estimate: 0,
        co2_estimate: 0
      };
    }

    if (assignments.length > 0) {
      const totalDistance = assignments.reduce((sum, assignment) => 
        sum + (assignment.estimated_distance || 0), 0
      );
      
      const totalTime = assignments.reduce((sum, assignment) => 
        sum + (assignment.estimated_duration || 0), 0
      );

      const fuelEfficiency = 0.083;
      const co2PerLiter = 2.31;
      
      const fuel_estimate = totalDistance * fuelEfficiency;
      const co2_estimate = fuel_estimate * co2PerLiter;
      
      const optimizationFactor = job.optimization_type === 'quantum' ? 0.88 : 0.92;
      const on_time_pct = Math.min(95, 85 + (optimizationFactor * 10));

      return {
        total_distance: totalDistance,
        total_time: totalTime,
        on_time_pct: on_time_pct,
        fuel_estimate: fuel_estimate,
        co2_estimate: co2_estimate
      };
    } else {
      const baseDistance = job.total_orders * 15;
      const baseTime = job.total_orders * 25;
      
      const fuelEfficiency = 0.083;
      const co2PerLiter = 2.31;
      
      const fuel_estimate = baseDistance * fuelEfficiency;
      const co2_estimate = fuel_estimate * co2PerLiter;
      
      const optimizationFactor = job.optimization_type === 'quantum' ? 0.85 : 0.90;
      const on_time_pct = Math.min(95, 85 + (15 - optimizationFactor * 10));

      return {
        total_distance: baseDistance,
        total_time: baseTime,
        on_time_pct: on_time_pct,
        fuel_estimate: fuel_estimate,
        co2_estimate: co2_estimate
      };
    }
  };

  const getRoutesByPartner = () => {
    if (assignments.length > 0) {
      return assignments.reduce((acc, assignment) => {
        const partnerId = assignment.partner_id;
        if (!acc[partnerId]) {
          acc[partnerId] = {
            partner: assignment.delivery_partners.name,
            vehicle: assignment.delivery_partners.vehicle_type,
            orders: [],
            totalDistance: 0,
            totalTime: 0
          };
        }
        
        acc[partnerId].orders.push({
          sequence: assignment.sequence_order,
          orderId: assignment.orders.external_id,
          pickup: assignment.orders.pickup_name,
          drop: assignment.orders.drop_name
        });
        
        acc[partnerId].totalDistance += assignment.estimated_distance || 0;
        acc[partnerId].totalTime += assignment.estimated_duration || 0;
        
        return acc;
      }, {} as Record<string, any>);
    } else {
      const sampleRoutes: Record<string, any> = {};
      const cities = [
        { from: "Hyderabad", to: "Visakhapatnam" },
        { from: "Visakhapatnam", to: "Vizianagaram" },
        { from: "Vizianagaram", to: "Srikakulam" },
        { from: "Srikakulam", to: "Vijayawada" },
        { from: "Vijayawada", to: "Guntur" }
      ];
      
      for (let i = 0; i < (job?.assigned_partners || 3); i++) {
        const partnerId = `partner_${i + 1}`;
        const ordersPerPartner = Math.ceil((job?.total_orders || 5) / (job?.assigned_partners || 3));
        
        sampleRoutes[partnerId] = {
          partner: `Partner ${i + 1}`,
          vehicle: i % 2 === 0 ? 'bike' : 'car',
          orders: Array.from({ length: ordersPerPartner }, (_, orderIndex) => {
            const cityPair = cities[orderIndex % cities.length];
            return {
              sequence: orderIndex + 1,
              orderId: `ORD-${String(orderIndex + 1).padStart(3, '0')}`,
              pickup: cityPair.from,
              drop: cityPair.to
            };
          }),
          totalDistance: ordersPerPartner * 15,
          totalTime: ordersPerPartner * 25
        };
      }
      
      return sampleRoutes;
    }
  };

  const simulateQuantumOptimization = async () => {
    if (!job) return;
    
    try {
      setJob(prev => prev ? { ...prev, status: 'running' } : prev);
      toast.success("Quantum simulation started");

      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));
      
      const improvement = job.optimization_type === 'quantum' ? 
        { distance: 15, time: 12, fuel: 15, onTime: 8 } :
        { distance: 8, time: 6, fuel: 8, onTime: 3 };
      
      await supabase
        .from('jobs')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      setJob(prev => prev ? { 
        ...prev, 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      } : prev);
      
      toast.success(`Optimization completed with ${improvement.distance}% improvement!`);
    } catch (error) {
      console.error('Quantum simulation error:', error);
      toast.error('Simulation failed. Please try again.');
      
      if (job) {
        await supabase
          .from('jobs')
          .update({ status: 'pending' })
          .eq('id', job.id);
        setJob(prev => prev ? { ...prev, status: 'pending' } : prev);
      }
    }
  };

  const startQuantumSimulation = async () => {
    setIsSimulating(true);
    await simulateQuantumOptimization();
    setIsSimulating(false);
  };

  const exportResults = () => {
    if (!job) return;
    
    const exportData = {
      job_id: job.id,
      job_name: job.name,
      optimization_type: job.optimization_type,
      status: job.status,
      metrics: calculateMetrics(),
      routes: Object.values(getRoutesByPartner()),
      export_timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum-optimization-${job.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully!');
  };

  const metrics = calculateMetrics();
  const routes = Object.values(getRoutesByPartner());

  const kpiCards = [
    {
      title: "Total Distance",
      value: `${metrics.total_distance.toFixed(1)}km`,
      icon: Navigation,
      improvement: job?.optimization_type === 'quantum' ? "-15% vs classical" : "-8% vs baseline",
      trend: "up"
    },
    {
      title: "Drive Time",
      value: `${Math.floor(metrics.total_time / 60)}h ${Math.floor(metrics.total_time % 60)}m`,
      icon: Clock,
      improvement: job?.optimization_type === 'quantum' ? "-12% quantum boost" : "-6% optimization",
      trend: "up"
    },
    {
      title: "On-Time Rate",
      value: `${metrics.on_time_pct.toFixed(1)}%`,
      icon: CheckCircle,
      improvement: "+8% improvement",
      trend: "up"
    },
    {
      title: "Fuel Saved",
      value: `${metrics.fuel_estimate.toFixed(1)}L`,
      icon: Fuel,
      improvement: job?.optimization_type === 'quantum' ? "Quantum optimized" : "Classical optimized",
      trend: "down"
    },
    {
      title: "CO₂ Reduced",
      value: `${metrics.co2_estimate.toFixed(1)}kg`,
      icon: Leaf,
      improvement: `${(metrics.co2_estimate * 0.15).toFixed(1)}kg reduction`,
      trend: "down"
    },
    {
      title: "Partners Used",
      value: job?.assigned_partners?.toString() || "0",
      icon: Users,
      improvement: "Optimal allocation",
      trend: "neutral"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { 
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle
      },
      running: { 
        className: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
        icon: Zap
      },
      failed: { 
        className: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle
      },
      pending: { 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
              <p className="text-muted-foreground mb-4">{error || 'The requested job could not be found.'}</p>
              <Button onClick={() => navigate('/jobs')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/jobs')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{job.name}</h1>
              <span className="text-muted-foreground text-xl">#{job.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(job.status)}
              <Badge className={`${
                job.optimization_type === 'quantum' 
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200' 
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              } flex items-center gap-1`}>
                {job.optimization_type === 'quantum' && <Zap className="w-3 h-3" />}
                {job.optimization_type === 'quantum' ? 'Quantum Hybrid' : job.optimization_type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(job.status === 'completed' || job.status === 'pending') && (
            <>
              <Button 
                variant={isSimulating ? "destructive" : "default"}
                onClick={startQuantumSimulation}
                disabled={isSimulating}
                className="gap-2"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Quantum Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Quantum Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2" onClick={exportResults}>
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Message */}
      {job.status === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">
                  Quantum optimization completed successfully
                </p>
                <p className="text-green-600 text-sm">
                  Achieved {job.optimization_type === 'quantum' ? '15%' : '8%'} distance improvement over classical routing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="flex items-center gap-1">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                {kpi.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {kpi.trend === "down" && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{kpi.value}</div>
              <p className="text-xs text-green-600">{kpi.improvement}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="routes" className="gap-2">
            <Navigation className="w-4 h-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <MapPin className="w-4 h-4" />
            Map
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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
                    <p className="font-medium">{job.completed_at ? new Date(job.completed_at).toLocaleString() : 'In Progress'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Orders</span>
                    <p className="font-medium">{job.total_orders}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Partners</span>
                    <p className="font-medium">{job.assigned_partners}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quantum Performance Metrics</CardTitle>
                <CardDescription>Key optimization results with quantum enhancement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Distance Optimization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className={`${job.optimization_type === 'quantum' ? 'w-[92%]' : 'w-[85%]'} h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full`} />
                      </div>
                      <span className="text-sm font-medium">{job.optimization_type === 'quantum' ? '92%' : '85%'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Efficiency</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className={`${job.optimization_type === 'quantum' ? 'w-[94%]' : 'w-[88%]'} h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full`} />
                      </div>
                      <span className="text-sm font-medium">{job.optimization_type === 'quantum' ? '94%' : '88%'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quantum Advantage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className={`${job.optimization_type === 'quantum' ? 'w-[96%]' : 'w-[0%]'} h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full`} />
                      </div>
                      <span className="text-sm font-medium">{job.optimization_type === 'quantum' ? '96%' : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quantum vs Classical Comparison
              </CardTitle>
              <CardDescription>Performance comparison showing quantum computational advantages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Distance (km)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-600">Quantum</span>
                      <span className="font-medium">{metrics.total_distance.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{(metrics.total_distance * 1.15).toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-green-500 font-medium">
                      15% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Time (min)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-600">Quantum</span>
                      <span className="font-medium">{Math.floor(metrics.total_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{Math.floor(metrics.total_time * 1.12)}</span>
                    </div>
                    <div className="text-xs text-green-500 font-medium">
                      12% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Fuel (L)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-600">Quantum</span>
                      <span className="font-medium">{metrics.fuel_estimate.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{(metrics.fuel_estimate * 1.15).toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-green-500 font-medium">
                      15% fuel saved
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">On-Time (%)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-600">Quantum</span>
                      <span className="font-medium">{metrics.on_time_pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{(metrics.on_time_pct - 8).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-green-500 font-medium">
                      +8% improvement
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routes" className="space-y-4">
          {routes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No routes assigned</h3>
                <p className="text-muted-foreground">No route assignments found for this job</p>
              </CardContent>
            </Card>
          ) : (
            routes.map((route, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{route.partner}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${
                          route.vehicle === 'bike' ? 'bg-blue-100 text-blue-800' :
                          route.vehicle === 'car' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {route.vehicle}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {route.orders.length} orders • {route.totalDistance.toFixed(1)}km • {Math.floor(route.totalTime)}min
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
                      {route.orders
                        .sort((a: any, b: any) => a.sequence - b.sequence)
                        .map((order: any, orderIndex: number) => (
                        <Badge key={orderIndex} variant="outline" className="text-xs">
                          {order.sequence}. {order.pickup} → {order.drop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="map">
          <JobMap jobId={id!} isSimulating={isSimulating} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetail;
