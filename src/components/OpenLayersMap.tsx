
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, MapPin, Truck, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getRoute } from '@/services/graphHopperService';
import { isWithinAP, apLocations } from '@/data/apLocations';
import { toast } from 'sonner';

// OpenLayers will be loaded via CDN in index.html
declare global {
  interface Window {
    ol: any;
  }
}

interface DeliveryPartner {
  id: string;
  name: string;
  vehicle_type: string;
  status: string;
  current_lat: number;
  current_lng: number;
  location_name?: string;
}

interface Order {
  [key: string]: any;
}

const OpenLayersMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routes, setRoutes] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    // Load OpenLayers from CDN
    const loadOpenLayers = async () => {
      if (window.ol) {
        setMapLoaded(true);
        return;
      }

      // Load OpenLayers CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/ol@7.5.2/ol.css';
      document.head.appendChild(cssLink);

      // Load OpenLayers JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ol@7.5.2/dist/ol.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadOpenLayers();
    fetchData();
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.ol && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && partners.length > 0) {
      updateMapMarkers();
    }
  }, [partners, orders]);

  const fetchData = async () => {
    try {
      // Fetch delivery partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      if (partnersError) throw partnersError;

      // Validate and filter partners within AP
      const validPartners = (partnersData || []).filter(partner => {
        const withinAP = isWithinAP(partner.current_lat, partner.current_lng);
        if (!withinAP) {
          console.warn(`Partner ${partner.name} is outside AP boundaries`);
        }
        return withinAP;
      });

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      if (ordersError) throw ordersError;

      // Validate orders and mark those outside AP
      const processedOrders = (ordersData || []).map(order => {
        const pickupInAP = isWithinAP(order.pickup_lat, order.pickup_lng);
        const dropInAP = isWithinAP(order.drop_lat, order.drop_lng);
        
        if (!pickupInAP || !dropInAP) {
          return {
            ...order,
            status: 'outside_ap',
            error_message: 'No delivery partners available - Outside AP'
          };
        }
        
        return order;
      });

      setPartners(validPartners);
      setOrders(processedOrders);

      // Generate routes for valid orders
      await generateRoutes(processedOrders.filter(o => o.status !== 'outside_ap'));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load map data');
    }
  };

  const generateRoutes = async (validOrders: Order[]) => {
    const newRoutes: { [key: string]: any } = {};
    
    for (const order of validOrders) {
      try {
        const route = await getRoute(
          order.pickup_lat,
          order.pickup_lng,
          order.drop_lat,
          order.drop_lng
        );
        
        if (route) {
          newRoutes[order.id] = route;
        }
      } catch (error) {
        console.error(`Error generating route for order ${order.id}:`, error);
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

    // Create map instance centered on Andhra Pradesh
    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([80.1863, 15.9129]), // Center of AP
        zoom: 7
      })
    });
  };

  const updateMapMarkers = () => {
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

    // Create features for partners
    const partnerFeatures = partners.map(partner => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([partner.current_lng, partner.current_lat])),
        partner: partner
      });

      const vehicleIcon = partner.vehicle_type === 'bike' ? '🏍️' : 
                         partner.vehicle_type === 'car' ? '🚗' : '🛵';

      feature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="blue" stroke="white" stroke-width="2"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12">${vehicleIcon}</text></svg>`,
          scale: 1
        })
      }));

      return feature;
    });

    // Create features for orders
    const orderFeatures: any[] = [];
    orders.forEach(order => {
      if (order.status === 'outside_ap') {
        // Show error marker for outside AP orders
        const errorFeature = new Feature({
          geometry: new Point(fromLonLat([order.pickup_lng, order.pickup_lat])),
          order: order,
          type: 'error'
        });

        errorFeature.setStyle(new Style({
          image: new Icon({
            src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="red" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">!</text></svg>`,
            scale: 1
          })
        }));

        orderFeatures.push(errorFeature);
        return;
      }

      // Pickup point
      const pickupFeature = new Feature({
        geometry: new Point(fromLonLat([order.pickup_lng, order.pickup_lat])),
        order: order,
        type: 'pickup'
      });

      pickupFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="green" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">P</text></svg>`,
          scale: 1
        })
      }));

      // Drop point
      const dropFeature = new Feature({
        geometry: new Point(fromLonLat([order.drop_lng, order.drop_lat])),
        order: order,
        type: 'drop'
      });

      dropFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="red" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">D</text></svg>`,
          scale: 1
        })
      }));

      orderFeatures.push(pickupFeature, dropFeature);

      // Add GraphHopper route if available
      if (routes[order.id]) {
        const routeCoords = routes[order.id].points.map((point: [number, number]) => 
          fromLonLat([point[0], point[1]])
        );
        
        const routeFeature = new Feature({
          geometry: new LineString(routeCoords)
        });

        const routeColor = order.status === 'completed' ? '#22c55e' : 
                          order.status === 'assigned' ? '#3b82f6' : '#6b7280';

        routeFeature.setStyle(new Style({
          stroke: new Stroke({
            color: routeColor,
            width: 3
          })
        }));

        orderFeatures.push(routeFeature);
      } else {
        // Fallback to straight line if no GraphHopper route
        const routeFeature = new Feature({
          geometry: new LineString([
            fromLonLat([order.pickup_lng, order.pickup_lat]),
            fromLonLat([order.drop_lng, order.drop_lat])
          ])
        });

        const routeColor = order.status === 'completed' ? '#22c55e' : 
                          order.status === 'assigned' ? '#3b82f6' : '#6b7280';

        routeFeature.setStyle(new Style({
          stroke: new Stroke({
            color: routeColor,
            width: 2,
            lineDash: [5, 5]
          })
        }));

        orderFeatures.push(routeFeature);
      }
    });

    // Add all features to vector layer
    const vectorSource = new VectorSource({
      features: [...partnerFeatures, ...orderFeatures]
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    mapInstanceRef.current.addLayer(vectorLayer);
  };

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      // Start simulation - move partners within AP boundaries
      const interval = setInterval(() => {
        setPartners(prevPartners => 
          prevPartners.map(partner => {
            let newLat = partner.current_lat + (Math.random() - 0.5) * 0.01;
            let newLng = partner.current_lng + (Math.random() - 0.5) * 0.01;
            
            // Ensure partners stay within AP boundaries
            if (!isWithinAP(newLat, newLng)) {
              newLat = partner.current_lat;
              newLng = partner.current_lng;
            }
            
            return {
              ...partner,
              current_lat: newLat,
              current_lng: newLng
            };
          })
        );
      }, 3000);

      // Stop after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        setIsSimulating(false);
      }, 30000);
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      const fromLonLat = window.ol.proj.fromLonLat;
      mapInstanceRef.current.getView().setCenter(fromLonLat([80.1863, 15.9129])); // Center of AP
      mapInstanceRef.current.getView().setZoom(7);
    }
  };

  const outsideAPOrders = orders.filter(order => order.status === 'outside_ap');

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Andhra Pradesh Live Map Controls
            </div>
            <div className="flex gap-2">
              <Button 
                variant={isSimulating ? "destructive" : "default"}
                onClick={toggleSimulation}
                className="gap-2"
                disabled={!mapLoaded}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </Button>
              <Button variant="outline" onClick={resetView} className="gap-2" disabled={!mapLoaded}>
                <RotateCcw className="w-4 h-4" />
                Reset View
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Delivery Partners ({partners.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Pickup Points ({orders.filter(o => o.status !== 'outside_ap').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Drop Points ({orders.filter(o => o.status !== 'outside_ap').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">Outside AP ({outsideAPOrders.length})</span>
            </div>
          </div>
          
          {outsideAPOrders.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Orders Outside Andhra Pradesh</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                {outsideAPOrders.length} order(s) are outside AP boundaries. No delivery partners available for these locations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          {!mapLoaded && (
            <div className="h-[600px] w-full rounded-lg flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading Andhra Pradesh Map...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className={`h-[600px] w-full rounded-lg ${!mapLoaded ? 'hidden' : ''}`}
          />
        </CardContent>
      </Card>

      {/* Partner Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {partners.map(partner => (
          <Card key={partner.id} className="partner-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{partner.name}</h3>
                <Truck className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <Badge className={`vehicle-badge-${partner.vehicle_type}`}>
                  {partner.vehicle_type}
                </Badge>
                <Badge className={`status-badge-${partner.status.replace('_', '-')}`}>
                  {partner.status}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {partner.location_name || 'Andhra Pradesh'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OpenLayersMap;
