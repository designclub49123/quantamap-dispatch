
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  CheckCircle,
  XCircle,
  Play,
  Phone,
  MessageSquare
} from "lucide-react";

interface RouteStop {
  id: string;
  type: 'pickup' | 'drop';
  name: string;
  address: string;
  contact?: string;
  eta: string;
  status: 'pending' | 'arrived' | 'completed' | 'failed';
  notes?: string;
  priority: number;
}

const Driver = () => {
  const [currentJob] = useState({
    id: "QF-001",
    name: "Morning Delivery Batch", 
    total_stops: 8,
    completed_stops: 3,
    estimated_completion: "14:30"
  });

  const [routeStops, setRouteStops] = useState<RouteStop[]>([
    {
      id: "1",
      type: "pickup",
      name: "Restaurant A",
      address: "123 MG Road, Andheri West",
      contact: "+91 98765 43210", 
      eta: "10:30",
      status: "completed",
      priority: 1
    },
    {
      id: "2", 
      type: "drop",
      name: "Customer 1",
      address: "456 SV Road, Bandra West",
      contact: "+91 87654 32109",
      eta: "10:45",
      status: "completed", 
      priority: 1
    },
    {
      id: "3",
      type: "pickup", 
      name: "Restaurant B",
      address: "789 Linking Road, Bandra",
      contact: "+91 76543 21098",
      eta: "11:15",
      status: "completed",
      priority: 2
    },
    {
      id: "4",
      type: "drop",
      name: "Customer 2", 
      address: "321 Hill Road, Bandra West",
      contact: "+91 65432 10987",
      eta: "11:30",
      status: "arrived",
      priority: 2
    },
    {
      id: "5",
      type: "pickup",
      name: "Restaurant C", 
      address: "654 Carter Road, Bandra",
      contact: "+91 54321 09876",
      eta: "12:00",
      status: "pending",
      priority: 3
    },
    {
      id: "6",
      type: "drop",
      name: "Customer 3",
      address: "987 Turner Road, Bandra",
      contact: "+91 43210 98765",
      eta: "12:15", 
      status: "pending",
      priority: 3
    }
  ]);

  const updateStopStatus = (stopId: string, newStatus: RouteStop['status']) => {
    setRouteStops(prev => prev.map(stop => 
      stop.id === stopId ? { ...stop, status: newStatus } : stop
    ));
  };

  const getStatusIcon = (status: RouteStop['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'arrived':
        return <MapPin className="w-4 h-4 text-primary" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: RouteStop['status']) => {
    const statusClasses = {
      pending: "bg-warning-100 text-warning-700 border-warning-200",
      arrived: "bg-primary/20 text-primary border-primary/30",
      completed: "bg-success-100 text-success-700 border-success-200", 
      failed: "bg-destructive/20 text-destructive border-destructive/30"
    };

    return (
      <Badge className={`status-badge ${statusClasses[status]}`}>
        {status}
      </Badge>
    );
  };

  const currentStop = routeStops.find(stop => stop.status === 'arrived');
  const nextStop = routeStops.find(stop => stop.status === 'pending');
  const progress = (currentJob.completed_stops / currentJob.total_stops) * 100;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-3">
          <div className="p-2 bg-fleet-gradient rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          My Route
        </h1>
        <p className="text-muted-foreground mt-2">
          {currentJob.name} • #{currentJob.id}
        </p>
      </div>

      {/* Progress Summary */}
      <Card className="quantum-card">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Route Progress</CardTitle>
            <Badge className="bg-success-100 text-success-700">
              Active
            </Badge>
          </div>
          <CardDescription>
            {currentJob.completed_stops} of {currentJob.total_stops} stops completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span>Progress: {progress.toFixed(0)}%</span>
            <span>ETA: {currentJob.estimated_completion}</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Stop Actions */}
      {currentStop && (
        <Card className="quantum-card border-primary/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-primary">
              <MapPin className="w-5 h-5" />
              Current Stop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{currentStop.name}</h3>
                <Badge className={`vehicle-badge-${currentStop.type === 'pickup' ? 'car' : 'bike'}`}>
                  {currentStop.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentStop.address}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ETA: {currentStop.eta}
                </span>
                {currentStop.contact && (
                  <Button variant="ghost" size="sm" className="h-6 p-1">
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                className="quantum-gradient text-white"
                onClick={() => updateStopStatus(currentStop.id, 'completed')}
              >
                {currentStop.type === 'pickup' ? 'Picked Up' : 'Delivered'}
              </Button>
              <Button 
                variant="destructive"
                onClick={() => updateStopStatus(currentStop.id, 'failed')}
              >
                Failed
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Stop Preview */}
      {nextStop && (
        <Card className="quantum-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Next Stop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{nextStop.name}</h3>
              <Badge className={`vehicle-badge-${nextStop.type === 'pickup' ? 'car' : 'bike'}`}>
                {nextStop.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{nextStop.address}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ETA: {nextStop.eta}
              </span>
              <Button 
                size="sm" 
                onClick={() => updateStopStatus(nextStop.id, 'arrived')}
                className="gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route List */}
      <Card className="quantum-card">
        <CardHeader>
          <CardTitle className="text-lg">All Stops</CardTitle>
          <CardDescription>Complete route sequence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {routeStops.map((stop, index) => (
            <div 
              key={stop.id} 
              className={`p-3 rounded-lg border transition-all ${
                stop.status === 'arrived' ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    {getStatusIcon(stop.status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{stop.name}</h4>
                      <Badge className={`vehicle-badge-${stop.type === 'pickup' ? 'car' : 'bike'}`}>
                        {stop.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{stop.address}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>ETA: {stop.eta}</span>
                      {stop.contact && (
                        <Button variant="ghost" size="sm" className="h-4 p-0">
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(stop.status)}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${stop.priority === 1 ? 'border-destructive text-destructive' : ''}`}
                  >
                    P{stop.priority}
                  </Badge>
                </div>
              </div>
              
              {stop.status === 'arrived' && (
                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
                  <Button 
                    size="sm"
                    className="quantum-gradient text-white"
                    onClick={() => updateStopStatus(stop.id, 'completed')}
                  >
                    {stop.type === 'pickup' ? 'Picked Up' : 'Delivered'}
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => updateStopStatus(stop.id, 'failed')}
                  >
                    Failed
                  </Button>
                </div>
              )}
              
              {stop.status === 'pending' && index === routeStops.findIndex(s => s.status === 'pending') && (
                <div className="mt-3 pt-3 border-t">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => updateStopStatus(stop.id, 'arrived')}
                  >
                    <Play className="w-4 h-4" />
                    Start This Stop
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="quantum-card border-warning-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Need Help?</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Support
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="w-4 h-4" />
                Emergency
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Driver;
