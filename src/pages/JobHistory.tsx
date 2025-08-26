
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  History, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  BarChart3,
  Download
} from "lucide-react";

interface JobHistoryItem {
  id: string;
  name: string;
  status: string;
  total_orders: number;
  assigned_partners: number;
  optimization_type: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  metadata: any;
}

const JobHistory = () => {
  const [jobs, setJobs] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchJobHistory();
  }, []);

  const fetchJobHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching job history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-warning-100 text-warning-700 border-warning-200",
      running: "bg-primary/20 text-primary border-primary/30",
      completed: "bg-success-100 text-success-700 border-success-200",
      failed: "bg-destructive/20 text-destructive border-destructive/30"
    };

    return (
      <Badge className={`status-badge ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
        {status}
      </Badge>
    );
  };

  const calculateDuration = (job: JobHistoryItem) => {
    const start = new Date(job.created_at);
    const end = job.completed_at ? new Date(job.completed_at) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const stats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    running: jobs.filter(j => j.status === 'running').length,
    failed: jobs.filter(j => j.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading job history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            Job History
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete history of all optimization jobs and their performance
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export History
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
            <p className="text-xs text-muted-foreground">All time</p>
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
            <div className="text-2xl font-bold text-success-500">{stats.completed}</div>
            <p className="text-xs text-success-500">
              {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Running
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.running}</div>
            <p className="text-xs text-muted-foreground">Active now</p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
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
                <option value="pending">Pending</option>
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
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No optimization jobs have been created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="quantum-card hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <h3 className="text-lg font-semibold">{job.name}</h3>
                      <span className="text-muted-foreground text-sm">#{job.id.slice(0, 8)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getStatusBadge(job.status)}
                      <Badge variant="outline">
                        {job.optimization_type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                      <span>{job.total_orders} orders</span>
                      <span>{job.assigned_partners} partners</span>
                      <span>Duration: {calculateDuration(job)}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    {job.status === 'completed' && (
                      <div className="text-sm text-success-500 font-medium">
                        ✓ Completed {job.completed_at ? new Date(job.completed_at).toLocaleTimeString() : ''}
                      </div>
                    )}
                    {job.status === 'failed' && (
                      <div className="text-sm text-destructive font-medium">
                        ✗ Failed
                      </div>
                    )}
                    {job.status === 'running' && (
                      <div className="text-sm text-primary font-medium animate-pulse">
                        ⟳ In Progress
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobHistory;
