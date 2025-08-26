
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('JobDetail component rendered with jobId:', jobId);

  useEffect(() => {
    console.log('useEffect triggered with jobId:', jobId);
    if (jobId) {
      fetchJobData();
    } else {
      setError('No job ID provided');
      setLoading(false);
    }
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      console.log('Fetching job data for ID:', jobId);
      setLoading(true);
      setError(null);
      
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      console.log('Job data response:', { jobData, jobError });

      if (jobError) {
        console.error('Job fetch error:', jobError);
        throw jobError;
      }

      if (!jobData) {
        throw new Error('Job not found');
      }

      console.log('Setting job data:', jobData);
      setJob(jobData);
    } catch (error) {
      console.error('Error fetching job data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load job data');
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const simulateQuantumOptimization = async () => {
    if (!job) return;
    
    try {
      console.log('🔮 Starting Quantum Fleet Optimization Simulation');
      
      await supabase
        .from('jobs')
        .update({ 
          status: 'running', 
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      setJob(prev => prev ? { ...prev, status: 'running' } : prev);
      toast.success("Quantum simulation started");

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 5000));
      
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
      
      toast.success('Optimization completed successfully!');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Simulation failed. Please try again.');
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
      export_timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-${job.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully!');
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-700 border-green-200",
      running: "bg-blue-100 text-blue-700 border-blue-200",
      failed: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };

    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}>
        {status}
      </Badge>
    );
  };

  console.log('Rendering JobDetail with state:', { loading, error, job });

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
            <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
            <Button onClick={() => navigate('/jobs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
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
              <Badge className="bg-purple-100 text-purple-700">
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
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Optimization
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.total_orders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.assigned_partners}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">{job.status}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">{job.optimization_type}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(job.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : 'Pending'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Optimization job configuration and results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Job Name</span>
                  <p className="font-medium">{job.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Optimization Type</span>
                  <p className="font-medium capitalize">{job.optimization_type}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <p className="font-medium">{job.total_orders}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Assigned Partners</span>
                  <p className="font-medium">{job.assigned_partners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>Delivery routes and assignments for this job</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Route details will be displayed here once optimization is complete.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
              <CardDescription>Visual representation of routes and delivery locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Interactive Map</p>
                  <p className="text-muted-foreground">Route visualization for job: {job.name}</p>
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
