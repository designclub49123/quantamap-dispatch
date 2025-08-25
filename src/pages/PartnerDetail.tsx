
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  TrendingUp, 
  Package,
  Navigation,
  Phone,
  Mail,
  Edit,
  MoreVertical
} from "lucide-react";

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, this would come from Supabase
  const partner = {
    id: "p1",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    email: "rahul.kumar@quantumfleet.com",
    vehicle_type: "bike" as const,
    capacity: 8,
    shift_start: "09:00",
    shift_end: "18:00",
    active: true,
    location: "Andheri West",
    assigned_today: 12,
    success_rate: 97.5,
    avg_delivery_time: 24.3,
    total_deliveries: 1247,
    rating: 4.8,
    join_date: "2023-08-15"
  };

  const recentJobs = [
    {
      id: "QF-001",
      date: "2024-01-15",
      orders: 8,
      completed: 8,
      avg_time: 22.5,
      distance: 45.2,
      status: "completed"
    },
    {
      id: "QF-002", 
      date: "2024-01-14",
      orders: 10,
      completed: 9,
      avg_time: 26.1,
      distance: 52.8,
      status: "completed"
    },
    {
      id: "QF-003",
      date: "2024-01-13", 
      orders: 7,
      completed: 7,
      avg_time: 21.3,
      distance: 38.9,
      status: "completed"
    }
  ];

  const performanceStats = [
    {
      title: "Total Deliveries",
      value: partner.total_deliveries.toLocaleString(),
      icon: Package,
      trend: "+45 this month"
    },
    {
      title: "Success Rate",
      value: `${partner.success_rate}%`,
      icon: Star,
      trend: "+2.1% vs avg"
    },
    {
      title: "Avg Delivery Time",
      value: `${partner.avg_delivery_time}min`,
      icon: Clock,
      trend: "-5min improvement"
    },
    {
      title: "Customer Rating",
      value: partner.rating.toString(),
      icon: TrendingUp,
      trend: "Excellent"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/partners')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Partners
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{partner.name}</h1>
            <p className="text-muted-foreground">Partner Details & Performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="quantum-card">
            <CardHeader className="text-center pb-4">
              <div className="w-24 h-24 bg-quantum-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {partner.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <CardTitle className="text-xl">{partner.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge className={`vehicle-badge-${partner.vehicle_type}`}>
                  {partner.vehicle_type}
                </Badge>
                <Badge 
                  variant={partner.active ? "default" : "secondary"}
                  className={partner.active ? "bg-success-100 text-success-700" : ""}
                >
                  {partner.active ? "Online" : "Offline"}
                </Badge>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{partner.phone}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{partner.email}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{partner.location}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{partner.shift_start} - {partner.shift_end}</span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <span className="font-medium">{partner.capacity} orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Join Date</span>
                  <span className="font-medium">{new Date(partner.join_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Assigned Today</span>
                  <span className="font-medium">{partner.assigned_today} orders</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-4">
            {performanceStats.map((stat, index) => (
              <Card key={index} className="kpi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Job History</TabsTrigger>
              <TabsTrigger value="map">Current Route</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card className="quantum-card">
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                  <CardDescription>Last 7 days delivery statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Orders Completed</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full">
                          <div className="w-full h-full bg-success-gradient rounded-full" />
                        </div>
                        <span className="text-sm font-medium">42/42</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On-Time Delivery</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full">
                          <div className="w-[95%] h-full bg-quantum-gradient rounded-full" />
                        </div>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Rating</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full">
                          <div className="w-[96%] h-full bg-fleet-gradient rounded-full" />
                        </div>
                        <span className="text-sm font-medium">4.8/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              {recentJobs.map((job) => (
                <Card key={job.id} className="quantum-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{job.id}</span>
                          <Badge className="status-badge-completed">
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(job.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Orders:</span>
                            <span className="ml-1 font-medium">{job.completed}/{job.orders}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <span className="ml-1 font-medium">{job.avg_time}min</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {job.distance}km total distance
                        </p>
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
                    <Navigation className="w-5 h-5" />
                    Current Route
                  </CardTitle>
                  <CardDescription>Live delivery route tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">Interactive map will be displayed here</p>
                      <p className="text-sm text-muted-foreground">Leaflet + OpenFreeMap integration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
