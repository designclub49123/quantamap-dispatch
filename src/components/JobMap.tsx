
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, Route, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getRoute } from '@/services/graphHopperService';
import { isWithinAP, apLocations } from '@/data/apLocations';
import { toast } from 'sonner';

// OpenLayers will be loaded via CDN
declare global {
  interface Window {
    ol: any;
  }
}

interface JobMapProps {
  jobId: string;
  isSimulating?: boolean;
}

interface JobAssignment {
  id: string;
  job_id: string;
  order_id: string;
  partner_id: string;
  sequence: number;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  orders: any;
  delivery_partners: any;
}

const JobMap: React.FC<JobMapProps> = ({ jobId, isSimulating = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [routes, setRoutes] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpenLayers();
    fetchJobAssignments();
  }, [jobId]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.ol && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && assignments.length > 0) {
      updateMapVisualization();
    }
  }, [assignments, routes]);

  const loadOpenLayers = async () => {
    if (window.ol) {
      setMapLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/ol@7.5.2/ol.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/ol@7.5.2/dist/ol.js';
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };

  const fetchJobAssignments = async () => {
    try {
      setLoading(true);
      
      const { data: assignmentsData, error } = await supabase
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
            vehicle_type,
            current_lat,
            current_lng
          )
        `)
        .eq('job_id', jobId)
        .order('partner_id', { ascending: true })
        .order('sequence_order', { ascending: true });

      if (error) throw error;

      setAssignments(assignmentsData || []);

      // Generate routes for assignments
      if (assignmentsData && assignmentsData.length > 0) {
        await generateRoutes(assignmentsData);
      }
    } catch (error) {
      console.error('Error fetching job assignments:', error);
      toast.error('Failed to load job assignments');
    } finally {
      setLoading(false);
    }
  };

  const generateRoutes = async (assignmentsData: JobAssignment[]) => {
    const newRoutes: { [key: string]: any } = {};
    
    for (const assignment of assignmentsData) {
      try {
        const route = await getRoute(
          assignment.orders.pickup_lat,
          assignment.orders.pickup_lng,
          assignment.orders.drop_lat,
          assignment.orders.drop_lng
        );
        
        if (route) {
          newRoutes[assignment.id] = route;
        }
      } catch (error) {
        console.error(`Error generating route for assignment ${assignment.id}:`, error);
      }
    }
    
    setRoutes(newRoutes);
  };

  const initializeMap = () => {
    if (!window.ol || !mapRef.current) return;

    const ol = window.ol;
    const Map = ol.Map;
    const View = ol.View;
    const OSM = ol.source.OSM;
    const TileLayer = ol.layer.Tile;
    const fromLonLat = ol.proj.fromLonLat;

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([80.1863, 15.9129]), // Center of AP
        zoom: 8
      })
    });
  };

  const updateMapVisualization = () => {
    if (!window.ol || !mapInstanceRef.current) return;

    const ol = window.ol;
    const VectorLayer = ol.layer.Vector;
    const VectorSource = ol.source.Vector;
    const Feature = ol.Feature;
    const Point = ol.geom.Point;
    const LineString = ol.geom.LineString;
    const Style = ol.style.Style;
    const Icon = ol.style.Icon;
    const Stroke = ol.style.Stroke;
    const Fill = ol.style.Fill;
    const Text = ol.style.Text;
    const fromLonLat = ol.proj.fromLonLat;

    // Clear existing vector layers
    const layers = mapInstanceRef.current.getLayers().getArray();
    layers.forEach((layer: any) => {
      if (layer instanceof VectorLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const features: any[] = [];

    // Create features for each assignment
    assignments.forEach((assignment, index) => {
      const partnerColor = getPartnerColor(assignment.partner_id);
      
      // Partner location (if available)
      if (assignment.delivery_partners.current_lat && assignment.delivery_partners.current_lng) {
        const partnerFeature = new Feature({
          geometry: new Point(fromLonLat([
            assignment.delivery_partners.current_lng,
            assignment.delivery_partners.current_lat
          ])),
          type: 'partner',
          assignment: assignment
        });

        const vehicleIcon = assignment.delivery_partners.vehicle_type === 'bike' ? '🏍️' : 
                           assignment.delivery_partners.vehicle_type === 'car' ? '🚗' : '🛵';

        partnerFeature.setStyle(new Style({
          image: new Icon({
            src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="${partnerColor}" stroke="white" stroke-width="2"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12">${vehicleIcon}</text></svg>`,
            scale: 1
          })
        }));

        features.push(partnerFeature);
      }

      // Pickup point
      const pickupFeature = new Feature({
        geometry: new Point(fromLonLat([
          assignment.orders.pickup_lng,
          assignment.orders.pickup_lat
        ])),
        type: 'pickup',
        assignment: assignment
      });

      pickupFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="green" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${assignment.sequence}</text></svg>`,
          scale: 1
        })
      }));

      // Drop point
      const dropFeature = new Feature({
        geometry: new Point(fromLonLat([
          assignment.orders.drop_lng,
          assignment.orders.drop_lat
        ])),
        type: 'drop',
        assignment: assignment
      });

      dropFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="red" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${assignment.sequence}</text></svg>`,
          scale: 1
        })
      }));

      features.push(pickupFeature, dropFeature);

      // Route line
      if (routes[assignment.id]) {
        const routeCoords = routes[assignment.id].points.map((point: [number, number]) => 
          fromLonLat([point[0], point[1]])
        );
        
        const routeFeature = new Feature({
          geometry: new LineString(routeCoords),
          type: 'route',
          assignment: assignment
        });

        routeFeature.setStyle(new Style({
          stroke: new Stroke({
            color: partnerColor,
            width: 3
          })
        }));

        features.push(routeFeature);
      } else {
        // Fallback to straight line
        const routeFeature = new Feature({
          geometry: new LineString([
            fromLonLat([assignment.orders.pickup_lng, assignment.orders.pickup_lat]),
            fromLonLat([assignment.orders.drop_lng, assignment.orders.drop_lat])
          ]),
          type: 'route',
          assignment: assignment
        });

        routeFeature.setStyle(new Style({
          stroke: new Stroke({
            color: partnerColor,
            width: 2,
            lineDash: [5, 5]
          })
        }));

        features.push(routeFeature);
      }
    });

    // Add all features to vector layer
    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    mapInstanceRef.current.addLayer(vectorLayer);

    // Fit map to show all features
    if (features.length > 0) {
      const extent = vectorSource.getExtent();
      mapInstanceRef.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 12
      });
    }
  };

  const getPartnerColor = (partnerId: string): string => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const index = partnerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getPartnerStats = () => {
    const partnerGroups = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.partner_id]) {
        acc[assignment.partner_id] = {
          name: assignment.delivery_partners.name,
          vehicle: assignment.delivery_partners.vehicle_type,
          orders: 0,
          distance: 0,
          color: getPartnerColor(assignment.partner_id)
        };
      }
      acc[assignment.partner_id].orders++;
      acc[assignment.partner_id].distance += assignment.distance_km || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(partnerGroups);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading job map...</p>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Routes Available</h3>
            <p className="text-muted-foreground">No job assignments found for this job</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const partnerStats = getPartnerStats();

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Job Route Visualization
            {isSimulating && (
              <Badge className="bg-quantum-gradient text-white animate-pulse">
                Quantum Simulation Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!mapLoaded && (
            <div className="h-[500px] w-full rounded-lg flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading Map...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className={`h-[500px] w-full rounded-lg ${!mapLoaded ? 'hidden' : ''}`}
          />
        </CardContent>
      </Card>

      {/* Legend and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Pickup Points (numbered by sequence)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Drop Points (numbered by sequence)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Delivery Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span>Optimized Routes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Partner Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partnerStats.map((partner, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: partner.color }}
                    ></div>
                    <span className="text-sm font-medium">{partner.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {partner.vehicle}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {partner.orders} orders • {partner.distance.toFixed(1)}km
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobMap;
