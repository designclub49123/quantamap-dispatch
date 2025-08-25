
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Users, 
  Plus,
  MapPin,
  Clock,
  TrendingUp,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Partner {
  id: string;
  name: string;
  vehicle_type: 'bike' | 'scooter' | 'car' | 'van' | 'truck';
  capacity: number;
  shift_start: string;
  shift_end: string;
  active: boolean;
  assigned_today: number;
  success_rate: number;
  avg_delivery_time: number;
  location?: string;
}

const Partners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVehicle, setFilterVehicle] = useState<string>("all");

  // Mock data - in real app, this would come from Supabase
  const partners: Partner[] = [
    {
      id: "p1",
      name: "Rahul Kumar",
      vehicle_type: "bike",
      capacity: 8,
      shift_start: "09:00",
      shift_end: "18:00",
      active: true,
      assigned_today: 12,
      success_rate: 97.5,
      avg_delivery_time: 24.3,
      location: "Andheri West"
    },
    {
      id: "p2",
      name: "Priya Singh",
      vehicle_type: "scooter",
      capacity: 12,
      shift_start: "10:00",
      shift_end: "19:00",
      active: true,
      assigned_today: 8,
      success_rate: 95.2,
      avg_delivery_time: 26.1,
      location: "Bandra East"
    },
    {
      id: "p3",
      name: "Amit Patel",
      vehicle_type: "car",
      capacity: 20,
      shift_start: "08:00",
      shift_end: "17:00",
      active: false,
      assigned_today: 0,
      success_rate: 92.8,
      avg_delivery_time: 31.5,
      location: "Powai"
    },
    {
      id: "p4",
      name: "Sneha Reddy",
      vehicle_type: "bike",
      capacity: 10,
      shift_start: "11:00",
      shift_end: "20:00",
      active: true,
      assigned_today: 15,
      success_rate: 98.1,
      avg_delivery_time: 22.7,
      location: "Koramangala"
    },
    {
      id: "p5",
      name: "Vikash Singh",
      vehicle_type: "van",
      capacity: 35,
      shift_start: "07:00",
      shift_end: "16:00",
      active: true,
      assigned_today: 3,
      success_rate: 89.4,
      avg_delivery_time: 45.2,
      location: "Whitefield"
    }
  ];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = filterVehicle === "all" || partner.vehicle_type === filterVehicle;
    return matchesSearch && matchesVehicle;
  });

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.active).length,
    avgSuccessRate: partners.reduce((acc, p) => acc + p.success_rate, 0) / partners.length,
    totalAssigned: partners.reduce((acc, p) => acc + p.assigned_today, 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-fleet-gradient rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            Delivery Partners
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your delivery team and track performance metrics
          </p>
        </div>
        <Button className="quantum-gradient text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Partners
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active today
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-success-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1% vs last week
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders Today
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssigned}</div>
            <p className="text-xs text-muted-foreground">
              Assigned deliveries
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Delivery Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26.4min</div>
            <p className="text-xs text-success-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              -5% improvement
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
                  placeholder="Search partners or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterVehicle}
                onChange={(e) => setFilterVehicle(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Vehicles</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card 
            key={partner.id} 
            className="partner-card"
            onClick={() => navigate(`/partners/${partner.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-quantum-gradient rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {partner.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`vehicle-badge-${partner.vehicle_type}`}>
                        {partner.vehicle_type}
                      </Badge>
                      <Badge 
                        variant={partner.active ? "default" : "secondary"}
                        className={partner.active ? "bg-success-100 text-success-700" : ""}
                      >
                        {partner.active ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{partner.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{partner.shift_start} - {partner.shift_end}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-semibold">{partner.assigned_today}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{partner.success_rate}%</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{partner.avg_delivery_time}min</div>
                  <div className="text-xs text-muted-foreground">Avg Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Partners;
