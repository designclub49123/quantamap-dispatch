
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  MapPin, 
  Play, 
  Pause, 
  SkipForward,
  SkipBack,
  Filter,
  Eye,
  EyeOff,
  Users,
  Navigation
} from "lucide-react";

const Map = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState([1]);
  const [visibleLayers, setVisibleLayers] = useState({
    partners: true,
    routes: true,
    orders: true,
    depots: true
  });

  const activePartners = [
    {
      id: "p1",
      name: "Rahul Kumar",
      vehicle: "bike",
      status: "delivering",
      current_stop: "Customer 3",
      eta: "5 min",
      progress: 60,
      color: "#8b5cf6"
    },
    {
      id: "p2", 
      name: "Priya Singh",
      vehicle: "scooter",
      status: "en_route",
      current_stop: "Restaurant D",
      eta: "12 min",
      progress: 25,
      color: "#06b6d4"
    },
    {
      id: "p3",
      name: "Amit Patel", 
      vehicle: "car",
      status: "available",
      current_stop: "Depot",
      eta: "Ready",
      progress: 0,
      color: "#10b981"
    },
    {
      id: "p4",
      name: "Sneha Reddy",
      vehicle: "bike", 
      status: "delivering",
      current_stop: "Customer 8",
      eta: "8 min",
      progress: 80,
      color: "#f59e0b"
    }
  ];

  const simulationControls = [
    { icon: SkipBack, label: "Previous", action: () => {} },
    { 
      icon: isSimulating ? Pause : Play, 
      label: isSimulating ? "Pause" : "Play",
      action: () => setIsSimulating(!isSimulating),
      primary: true
    },
    { icon: SkipForward, label: "Next", action: () => {} }
  ];

  const layerToggles = [
    { key: 'partners', label: 'Partners', icon: Users },
    { key: 'routes', label: 'Routes', icon: Navigation },
    { key: 'orders', label: 'Orders', icon: MapPin },
    { key: 'depots', label: 'Depots', icon: MapPin }
  ];

  const toggleLayer = (key: string) => {
    setVisibleLayers(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-success-gradient rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            Live Map
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time delivery tracking and route visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isSimulating ? "default" : "secondary"}
            className={isSimulating ? "bg-primary/20 text-primary animate-pulse" : ""}
          >
            {isSimulating ? "Simulation Running" : "Simulation Paused"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Simulation Controls */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="text-lg">Simulation Controls</CardTitle>
              <CardDescription>Control delivery simulation playback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                {simulationControls.map(({ icon: Icon, label, action, primary }, index) => (
                  <Button 
                    key={index}
                    variant={primary ? "default" : "outline"}
                    size="sm"
                    onClick={action}
                    className={primary ? "quantum-gradient text-white" : ""}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Speed</label>
                  <span className="text-sm text-muted-foreground">{simulationSpeed[0]}x</span>
                </div>
                <Slider
                  value={simulationSpeed}
                  onValueChange={setSimulationSpeed}
                  max={10}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Layer Controls */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="text-lg">Map Layers</CardTitle>
              <CardDescription>Toggle visibility of map elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {layerToggles.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer(key)}
                    className="h-6 w-6 p-0"
                  >
                    {visibleLayers[key as keyof typeof visibleLayers] ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Partners */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="text-lg">Active Partners</CardTitle>
              <CardDescription>{activePartners.length} partners online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePartners.map((partner) => (
                <div key={partner.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: partner.color }}
                      />
                      <span className="text-sm font-medium">{partner.name}</span>
                    </div>
                    <Badge className={`status-badge-${partner.status.replace('_', '-')}`}>
                      {partner.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="pl-5 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Next: {partner.current_stop}</span>
                      <span>ETA: {partner.eta}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${partner.progress}%`,
                          backgroundColor: partner.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="quantum-card">
            <CardContent className="p-0">
              <div className="h-[600px] bg-muted/20 rounded-lg relative flex items-center justify-center">
                {/* Map Placeholder */}
                <div className="text-center space-y-4">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-xl font-semibold">Interactive Map</p>
                    <p className="text-muted-foreground">Leaflet + OpenFreeMap tiles integration</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Features: Real-time partner tracking, route polylines, delivery points
                    </p>
                  </div>
                  {isSimulating && (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm">Simulation running at {simulationSpeed[0]}x speed</span>
                    </div>
                  )}
                </div>

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Button variant="outline" size="sm" className="glass">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 glass p-3 space-y-2">
                  <h4 className="text-sm font-medium text-white">Legend</h4>
                  <div className="space-y-1">
                    {activePartners.map((partner) => (
                      <div key={partner.id} className="flex items-center gap-2 text-xs text-white/90">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: partner.color }}
                        />
                        <span>{partner.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;
