
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, MapPin, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
}

interface Order {
  id: string;
  external_id: string;
  pickup_name: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_name: string;
  drop_lat: number;
  drop_lng: number;
  status: string;
}

const OpenLayersMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

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

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      if (ordersError) throw ordersError;

      setPartners(partnersData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const initializeMap = () => {
    if (!window.ol || !mapRef.current) return;

    const { Map, View } = window.ol;
    const { OSM } = window.ol.source;
    const { Tile as TileLayer } = window.ol.layer;
    const { fromLonLat } = window.ol.proj;

    // Create map instance
    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Center of India
        zoom: 6
      })
    });
  };

  const updateMapMarkers = () => {
    if (!window.ol || !mapInstanceRef.current) return;

    const { Vector as VectorLayer } = window.ol.layer;
    const { Vector as VectorSource } = window.ol.source;
    const { Feature } = window.ol;
    const { Point, LineString } = window.ol.geom;
    const { Style, Icon, Stroke } = window.ol.style;
    const { fromLonLat } = window.ol.proj;

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
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="%233b82f6" stroke="white" stroke-width="2"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12">${vehicleIcon}</text></svg>`,
          scale: 1
        })
      }));

      return feature;
    });

    // Create features for orders (pickup and drop points)
    const orderFeatures: any[] = [];
    orders.forEach(order => {
      // Pickup point
      const pickupFeature = new Feature({
        geometry: new Point(fromLonLat([order.pickup_lng, order.pickup_lat])),
        order: order,
        type: 'pickup'
      });

      pickupFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="%2222c55e" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">P</text></svg>`,
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
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="%23ef4444" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">D</text></svg>`,
          scale: 1
        })
      }));

      // Route line
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
          width: 3
        })
      }));

      orderFeatures.push(pickupFeature, dropFeature, routeFeature);
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
      // Start simulation - move partners randomly
      const interval = setInterval(() => {
        setPartners(prevPartners => 
          prevPartners.map(partner => ({
            ...partner,
            current_lat: partner.current_lat + (Math.random() - 0.5) * 0.01,
            current_lng: partner.current_lng + (Math.random() - 0.5) * 0.01
          }))
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
      const { fromLonLat } = window.ol.proj;
      mapInstanceRef.current.getView().setCenter(fromLonLat([78.9629, 20.5937]));
      mapInstanceRef.current.getView().setZoom(6);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              OpenLayers Live Map Controls
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Delivery Partners ({partners.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Pickup Points ({orders.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Drop Points ({orders.length})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          {!mapLoaded && (
            <div className="h-[600px] w-full rounded-lg flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading OpenLayers Map...</p>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OpenLayersMap;
