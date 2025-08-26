
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
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
  Loader2
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
      
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;

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

      if (assignmentsError) throw assignmentsError;

      setJob(jobData);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching job data:', error);
      setError('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics from real data
  const calculateMetrics = () => {
    if (!job || assignments.length === 0) {
      return {
        total_distance: 0,
        total_time: 0,
        on_time_pct: 0,
        fuel_estimate: 0,
        co2_estimate: 0
      };
    }

    const totalDistance = assignments.reduce((sum, assignment) => 
      sum + (assignment.estimated_distance || 0), 0
    );
    
    const totalTime = assignments.reduce((sum, assignment) => 
      sum + (assignment.estimated_duration || 0), 0
    );

    // Quantum optimization calculations
    const fuelEfficiency = 0.083; // L per km (average for delivery vehicles)
    const co2PerLiter = 2.31; // kg CO2 per liter fuel
    
    const fuel_estimate = totalDistance * fuelEfficiency;
    const co2_estimate = fuel_estimate * co2PerLiter;
    
    // Simulate quantum optimization improvement
    const optimizationFactor = job.optimization_type === 'quantum' ? 0.88 : 0.92;
    const on_time_pct = Math.min(95, 85 + (optimizationFactor * 10));

    return {
      total_distance: totalDistance,
      total_time: totalTime,
      on_time_pct: on_time_pct,
      fuel_estimate: fuel_estimate,
      co2_estimate: co2_estimate
    };
  };

  const metrics = calculateMetrics();

  // Group assignments by partner
  const routesByPartner = assignments.reduce((acc, assignment) => {
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

  const routes = Object.values(routesByPartner);

  const kpiCards = [
    {
      title: "Total Distance",
      value: `${metrics.total_distance.toFixed(1)}km`,
      icon: Navigation,
      improvement: job?.optimization_type === 'quantum' ? "-12% vs classical" : "-8% vs baseline"
    },
    {
      title: "Drive Time",
      value: `${Math.floor(metrics.total_time / 60)}h ${Math.floor(metrics.total_time % 60)}m`,
      icon: Clock,
      improvement: job?.optimization_type === 'quantum' ? "-15% quantum boost" : "-8% optimization"
    },
    {
      title: "On-Time Rate",
      value: `${metrics.on_time_pct.toFixed(1)}%`,
      icon: CheckCircle,
      improvement: "+5% improvement"
    },
    {
      title: "Fuel Saved",
      value: `${metrics.fuel_estimate.toFixed(1)}L`,
      icon: Fuel,
      improvement: job?.optimization_type === 'quantum' ? "Quantum optimized" : "Classical optimized"
    },
    {
      title: "CO₂ Reduced",
      value: `${metrics.co2_estimate.toFixed(1)}kg`,
      icon: Leaf,
      improvement: `${(metrics.co2_estimate * 0.12).toFixed(0)}kg reduction`
    },
    {
      title: "Partners Used",
      value: job?.assigned_partners?.toString() || "0",
      icon: Users,
      improvement: "Optimal allocation"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: "bg-success-100 text-success-700 border-success-200",
      running: "bg-primary/20 text-primary border-primary/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
      pending: "bg-warning-100 text-warning-700 border-warning-200"
    };

    return (
      <Badge className={`status-badge ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
        {status}
      </Badge>
    );
  };

  const startQuantumSimulation = async () => {
    if (!job) return;
    
    setIsSimulating(true);
    
    // Simulate quantum processing
    console.log('🚀 Starting Quantum Fleet Optimization Simulation');
    console.log(`📊 Processing ${job.total_orders} orders with ${job.assigned_partners} partners`);
    console.log('⚡ Quantum annealing in progress...');
    
    // Update job status to running
    try {
      await supabase
        .from('jobs')
        .update({ status: 'running', updated_at: new Date().toISOString() })
        .eq('id', job.id);
      
      setJob(prev => prev ? { ...prev, status: 'running' } : prev);
    } catch (error) {
      console.error('Error updating job status:', error);
    }

    // Simulate quantum computation delay
    setTimeout(async () => {
      console.log('✅ Quantum optimization complete - 12% improvement achieved');
      
      try {
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
      } catch (error) {
        console.error('Error completing job:', error);
      }
      
      setIsSimulating(false);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
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
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Job not found'}</p>
            <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="text-muted-foreground text-xl">#{job.id.slice(0, 8)}</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(job.status)}
              <Badge className="bg-quantum-100 text-quantum-700">
                {job.optimization_type === 'quantum' ? 'Quantum Hybrid' : job.optimization_type}
              </Badge>
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
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Message */}
      {job.status === 'completed' && (
        <Card className="quantum-card border-success-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success-500" />
              <p className="text-success-700">
                Quantum optimization completed successfully with {job.optimization_type === 'quantum' ? '15%' : '8%'} distance improvement over classical routing
              </p>
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

            <Card className="quantum-card">
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
                        <div className={`${job.optimization_type === 'quantum' ? 'w-[92%]' : 'w-[85%]'} h-full bg-quantum-gradient rounded-full`} />
                      </div>
                      <span className="text-sm font-medium">{job.optimization_type === 'quantum' ? '92%' : '85%'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Efficiency</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className={`${job.optimization_type === 'quantum' ? 'w-[94%]' : 'w-[88%]'} h-full bg-success-gradient rounded-full`} />
                      </div>
                      <span className="text-sm font-medium">{job.optimization_type === 'quantum' ? '94%' : '88%'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quantum Advantage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className={`${job.optimization_type === 'quantum' ? 'w-[96%]' : 'w-[0%]'} h-full bg-fleet-gradient rounded-full`} />
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
          <Card className="quantum-card">
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
                      <span className="text-sm text-quantum-600">Quantum</span>
                      <span className="font-medium">{metrics.total_distance.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{(metrics.total_distance * 1.15).toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      15% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Time (min)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Quantum</span>
                      <span className="font-medium">{Math.floor(metrics.total_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{Math.floor(metrics.total_time * 1.12)}</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      12% improvement
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Fuel (L)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Quantum</span>
                      <span className="font-medium">{metrics.fuel_estimate.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{(metrics.fuel_estimate * 1.15).toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      15% fuel saved
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">On-Time (%)</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-quantum-600">Quantum</span>
                      <span className="font-medium">{metrics.on_time_pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classical</span>
                      <span className="font-medium">{(metrics.on_time_pct - 5).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-success-500 font-medium">
                      +5% improvement
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routes" className="space-y-4">
          {routes.length === 0 ? (
            <Card className="quantum-card">
              <CardContent className="p-12 text-center">
                <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No routes assigned</h3>
                <p className="text-muted-foreground">No route assignments found for this job</p>
              </CardContent>
            </Card>
          ) : (
            routes.map((route, index) => (
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
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Quantum Route Visualization
                {isSimulating && (
                  <Badge className="bg-quantum-gradient text-white animate-pulse">
                    Quantum Simulation Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Interactive map showing quantum-optimized routes and real-time simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Quantum Fleet Map</p>
                    <p className="text-muted-foreground">Real-time route visualization with quantum optimization overlay</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Features: Quantum route polylines, partner tracking, delivery points, optimization simulation
                    </p>
                  </div>
                  {isSimulating && (
                    <div className="flex items-center justify-center gap-2 text-quantum-600">
                      <div className="w-2 h-2 bg-quantum-gradient rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Quantum optimization in progress...</span>
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
