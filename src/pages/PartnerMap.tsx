import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Route, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getRoute } from '@/services/graphHopperService';
import { isWithinAP } from '@/data/apLocations';
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
  capacity?: number;
  location_name?: string;
}

interface Order {
  [key: string]: any;
}

const PartnerMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<{ [key: string]: any }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load OpenLayers from CDN
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

    loadOpenLayers();
    if (id) {
      fetchPartnerData(id);
    }
  }, [id]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.ol && !mapInstanceRef.current && partner) {
      initializeMap();
    }
  }, [mapLoaded, partner]);

  useEffect(() => {
    if (mapInstanceRef.current && partner && orders.length > 0) {
      updateMapMarkers();
    }
  }, [partner, orders, routes]);

  const fetchPartnerData = async (partnerId: string) => {
    try {
      setLoading(true);
      
      // Fetch partner details
      const { data: partnerData, error: partnerError } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (partnerError) throw partnerError;

      // Check if partner is within AP
      if (!isWithinAP(partnerData.current_lat, partnerData.current_lng)) {
        toast.error('Partner is outside Andhra Pradesh boundaries');
        navigate('/partners');
        return;
      }

      setPartner(partnerData);

      // Fetch assigned orders for this partner
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('job_assignments')
        .select(`
          *,
          orders:order_id (*)
        `)
        .eq('partner_id', partnerId);

      if (assignmentsError) throw assignmentsError;

      const partnerOrders = assignmentsData
        ?.map(assignment => assignment.orders)
        .filter(Boolean) || [];

      // Filter orders within AP
      const validOrders = partnerOrders.filter(order => 
        isWithinAP(order.pickup_lat, order.pickup_lng) && 
        isWithinAP(order.drop_lat, order.drop_lng)
      );

      setOrders(validOrders);
      
      // Generate routes for partner's orders
      await generatePartnerRoutes(partnerData, validOrders);

    } catch (error) {
      console.error('Error fetching partner data:', error);
      toast.error('Failed to load partner details');
      navigate('/partners');
    } finally {
      setLoading(false);
    }
  };

  const generatePartnerRoutes = async (partner: DeliveryPartner, orders: Order[]) => {
    const newRoutes: { [key: string]: any } = {};
    
    for (const order of orders) {
      try {
        // Route from partner to pickup
        const toPickupRoute = await getRoute(
          partner.current_lat,
          partner.current_lng,
          order.pickup_lat,
          order.pickup_lng
        );
        
        // Route from pickup to drop
        const deliveryRoute = await getRoute(
          order.pickup_lat,
          order.pickup_lng,
          order.drop_lat,
          order.drop_lng
        );
        
        newRoutes[`${order.id}_to_pickup`] = toPickupRoute;
        newRoutes[`${order.id}_delivery`] = deliveryRoute;
        
      } catch (error) {
        console.error(`Error generating route for order ${order.id}:`, error);
      }
    }
    
    setRoutes(newRoutes);
  };

  const initializeMap = () => {
    if (!window.ol || !mapRef.current || !partner) return;

    const ol = window.ol;
    const Map = ol.Map;
    const View = ol.View;
    const OSM = ol.source.OSM;
    const TileLayer = ol.layer.Tile;
    const fromLonLat = ol.proj.fromLonLat;

    // Create map instance centered on partner location
    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([partner.current_lng, partner.current_lat]),
        zoom: 12
      })
    });
  };

  const updateMapMarkers = () => {
    if (!window.ol || !mapInstanceRef.current || !partner) return;

    const ol = window.ol;
    const VectorLayer = ol.layer.Vector;
    const VectorSource = ol.source.Vector;
    const Feature = ol.Feature;
    const Point = ol.geom.Point;
    const LineString = ol.geom.LineString;
    const Style = ol.style.Style;
    const Icon = ol.style.Icon;
    const Stroke = ol.style.Stroke;
    const fromLonLat = ol.proj.fromLonLat;

    // Clear existing vector layers
    const layers = mapInstanceRef.current.getLayers().getArray();
    layers.forEach((layer: any) => {
      if (layer instanceof VectorLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const features: any[] = [];

    // Partner marker
    const partnerFeature = new Feature({
      geometry: new Point(fromLonLat([partner.current_lng, partner.current_lat])),
      type: 'partner'
    });

    const vehicleIcon = partner.vehicle_type === 'bike' ? '🏍️' : 
                       partner.vehicle_type === 'car' ? '🚗' : '🛵';

    partnerFeature.setStyle(new Style({
      image: new Icon({
        src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="blue" stroke="white" stroke-width="3"/><text x="20" y="25" text-anchor="middle" fill="white" font-size="14">${vehicleIcon}</text></svg>`,
        scale: 1
      })
    }));

    features.push(partnerFeature);

    // Order markers and routes
    orders.forEach((order, index) => {
      // Pickup marker
      const pickupFeature = new Feature({
        geometry: new Point(fromLonLat([order.pickup_lng, order.pickup_lat])),
        type: 'pickup',
        order: order
      });

      pickupFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="12" fill="green" stroke="white" stroke-width="2"/><text x="15" y="19" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${index + 1}P</text></svg>`,
          scale: 1
        })
      }));

      // Drop marker
      const dropFeature = new Feature({
        geometry: new Point(fromLonLat([order.drop_lng, order.drop_lat])),
        type: 'drop',
        order: order
      });

      dropFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="12" fill="red" stroke="white" stroke-width="2"/><text x="15" y="19" text-anchor="middle" fill="white" font-size="8" font-weight="bold">${index + 1}D</text></svg>`,
          scale: 1
        })
      }));

      features.push(pickupFeature, dropFeature);

      // Route to pickup
      const toPickupRoute = routes[`${order.id}_to_pickup`];
      if (toPickupRoute) {
        const toPickupCoords = toPickupRoute.points.map((point: [number, number]) => 
          fromLonLat([point[0], point[1]])
        );
        
        const toPickupFeature = new Feature({
          geometry: new LineString(toPickupCoords)
        });

        toPickupFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#ff9800',
            width: 4
          })
        }));

        features.push(toPickupFeature);
      }

      // Delivery route
      const deliveryRoute = routes[`${order.id}_delivery`];
      if (deliveryRoute) {
        const deliveryCoords = deliveryRoute.points.map((point: [number, number]) => 
          fromLonLat([point[0], point[1]])
        );
        
        const deliveryFeature = new Feature({
          geometry: new LineString(deliveryCoords)
        });

        deliveryFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#4caf50',
            width: 4
          })
        }));

        features.push(deliveryFeature);
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
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[600px] w-full rounded-lg flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading partner map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Partner not found or outside Andhra Pradesh</p>
            <Button onClick={() => navigate('/partners')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partners
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/partners')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{partner.name} - Delivery Route</h1>
          <p className="text-muted-foreground">
            {partner.location_name || 'Andhra Pradesh'} • {orders.length} assigned orders
          </p>
        </div>
      </div>

      {/* Partner Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Partner Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium">Vehicle Type</span>
              <Badge className={`vehicle-badge-${partner.vehicle_type} ml-2`}>
                {partner.vehicle_type}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Status</span>
              <Badge className={`status-badge-${partner.status.replace('_', '-')} ml-2`}>
                {partner.status}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Capacity</span>
              <span className="ml-2">{partner.capacity} orders</span>
            </div>
            <div>
              <span className="text-sm font-medium">Assigned Orders</span>
              <span className="ml-2">{orders.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          {!mapLoaded && (
            <div className="h-[600px] w-full rounded-lg flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading route map...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapRef} 
            className={`h-[600px] w-full rounded-lg ${!mapLoaded ? 'hidden' : ''}`}
          />
        </CardContent>
      </Card>

      {/* Route Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            Route Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Partner Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Route to Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Delivery Route</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Order #{order.external_id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.pickup_name} → {order.drop_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{order.status}</Badge>
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
                
                {routes[`${order.id}_delivery`] && (
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Route className="w-3 h-3" />
                      {(routes[`${order.id}_delivery`].distance / 1000).toFixed(1)} km
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(routes[`${order.id}_delivery`].time / 60000)} min
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerMap;
