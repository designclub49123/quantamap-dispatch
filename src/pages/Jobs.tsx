
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  BarChart3, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Zap,
  Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'postprocessing' | 'completed' | 'failed';
  objective: 'distance' | 'time' | 'cost' | 'on_time';
  solver_mode: 'hybrid' | 'quantum_only' | 'classical_only';
  orders_count: number;
  partners_count: number;
  created_at: string;
  completed_at?: string;
  total_distance_km?: number;
  total_drive_minutes?: number;
  on_time_pct?: number;
  progress?: number;
}

const Jobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data - in real app, this would come from Supabase
  const jobs: Job[] = [
    {
      id: "QF-001",
      name: "Morning Delivery Batch",
      status: "completed",
      objective: "distance",
      solver_mode: "hybrid",
      orders_count: 45,
      partners_count: 8,
      created_at: "2024-01-15T08:30:00Z",
      completed_at: "2024-01-15T08:45:00Z",
      total_distance_km: 287.5,
      total_drive_minutes: 420,
      on_time_pct: 94.2
    },
    {
      id: "QF-002",
      name: "Lunch Rush Optimization",
      status: "running",
      objective: "time",
      solver_mode: "hybrid",
      orders_count: 32,
      partners_count: 6,
      created_at: "2024-01-15T11:45:00Z",
      progress: 75
    },
    {
      id: "QF-003",
      name: "Evening Peak Routes",
      status: "queued",
      objective: "on_time",
      solver_mode: "quantum_only",
      orders_count: 28,
      partners_count: 5,
      created_at: "2024-01-15T16:20:00Z"
    },
    {
      id: "QF-004",
      name: "Weekend Special Orders",
      status: "completed",
      objective: "cost",
      solver_mode: "classical_only",
      orders_count: 67,
      partners_count: 12,
      created_at: "2024-01-14T09:15:00Z",
      completed_at: "2024-01-14T09:32:00Z",
      total_distance_km: 445.8,
      total_drive_minutes: 620,
      on_time_pct: 91.8
    },
    {
      id: "QF-005",
      name: "Express Delivery Batch",
      status: "failed",
      objective: "time",
      solver_mode: "hybrid",
      orders_count: 15,
      partners_count: 3,
      created_at: "2024-01-14T14:20:00Z"
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    running: jobs.filter(j => j.status === 'running').length,
    avgTime: 12.5 // minutes
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'running':
        return <Play className="w-4 h-4 text-primary animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning-500" />;
    }
  };

  const getStatusBadge = (status: Job['status']) => {
    const statusClasses = {
      queued: "bg-warning-100 text-warning-700 border-warning-200",
      running: "bg-primary/20 text-primary border-primary/30 animate-pulse",
      postprocessing: "bg-fleet-100 text-fleet-700 border-fleet-200",
      completed: "bg-success-100 text-success-700 border-success-200",
      failed: "bg-destructive/20 text-destructive border-destructive/30"
    };

    return (
      <Badge className={`status-badge ${statusClasses[status]}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getSolverBadge = (mode: Job['solver_mode']) => {
    const modeClasses = {
      hybrid: "bg-quantum-100 text-quantum-700",
      quantum_only: "bg-purple-100 text-purple-700",
      classical_only: "bg-fleet-100 text-fleet-700"
    };

    const modeLabels = {
      hybrid: "Hybrid Q+C",
      quantum_only: "Quantum Only",
      classical_only: "Classical"
    };

    return (
      <Badge className={modeClasses[mode]}>
        {modeLabels[mode]}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-quantum-gradient rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Optimization Jobs
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and monitor quantum-powered route optimization jobs
          </p>
        </div>
        <Button className="quantum-gradient text-white gap-2" onClick={() => navigate('/jobs/new')}>
          <Plus className="w-4 h-4" />
          New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-success-500">
              {((stats.completed / stats.total) * 100).toFixed(0)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Currently Running
            </CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.running}</div>
            <p className="text-xs text-muted-foreground">
              Active jobs
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Runtime
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTime}min</div>
            <p className="text-xs text-muted-foreground">
              Optimization time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="quantum-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card 
            key={job.id} 
            className="quantum-card hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <h3 className="text-lg font-semibold">{job.name}</h3>
                    <span className="text-muted-foreground">#{job.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(job.status)}
                    {getSolverBadge(job.solver_mode)}
                    <Badge variant="outline" className="gap-1">
                      <Zap className="w-3 h-3" />
                      {job.objective}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{job.orders_count} orders</span>
                    <span>{job.partners_count} partners</span>
                    <span>Created {new Date(job.created_at).toLocaleString()}</span>
                  </div>

                  {job.status === 'running' && job.progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-64 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-quantum-gradient rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {job.status === 'completed' && (
                  <div className="text-right space-y-2">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Distance:</span>
                        <span className="ml-2 font-medium">{job.total_distance_km?.toFixed(1)}km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <span className="ml-2 font-medium">{Math.floor((job.total_drive_minutes || 0) / 60)}h {(job.total_drive_minutes || 0) % 60}m</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">On-time:</span>
                        <span className="ml-2 font-medium text-success-500">{job.on_time_pct?.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Navigation className="w-4 h-4" />
                      View Results
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
