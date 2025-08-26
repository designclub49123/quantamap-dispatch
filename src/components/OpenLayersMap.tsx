import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, MapPin, Truck, ArrowLeft } from 'lucide-react';
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
  location_name?: string;
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
  pickup_location?: string;
  drop_location?: string;
}

interface OpenLayersMapProps {
  selectedPartnerId?: string;
}

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({ selectedPartnerId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);

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
    if (selectedPartnerId) {
      const partner = partners.find(p => p.id === selectedPartnerId);
      if (partner) {
        setSelectedPartner(partner);
      }
    }
  }, [selectedPartnerId, partners]);

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
        center: fromLonLat([79.7400, 15.9129]), // Center of Andhra Pradesh
        zoom: 7
      })
    });
  };

  const isInAndhraPradesh = (lat: number, lng: number): boolean => {
    // Rough bounds of Andhra Pradesh
    return lat >= 12.5 && lat <= 19.5 && lng >= 77.0 && lng <= 85.0;
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
    const Text = ol.style.Text;
    const Fill = ol.style.Fill;
    const fromLonLat = ol.proj.fromLonLat;

    // Clear existing vector layers
    const layers = mapInstanceRef.current.getLayers().getArray();
    layers.forEach((layer: any) => {
      if (layer instanceof VectorLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // If viewing individual partner, focus on that partner only
    if (selectedPartner) {
      const partnerFeature = new Feature({
        geometry: new Point(fromLonLat([selectedPartner.current_lng, selectedPartner.current_lat])),
        partner: selectedPartner
      });

      const vehicleIcon = selectedPartner.vehicle_type === 'bike' ? '🏍️' : 
                         selectedPartner.vehicle_type === 'car' ? '🚗' : '🛵';

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="18" fill="${isInAndhraPradesh(selectedPartner.current_lat, selectedPartner.current_lng) ? '#22c55e' : '#ef4444'}" stroke="white" stroke-width="3"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">${vehicleIcon}</text></svg>`;

      partnerFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
          scale: 1
        }),
        text: new Text({
          text: `${selectedPartner.name}\n${selectedPartner.location_name || 'Unknown Location'}`,
          font: '12px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          offsetY: -30
        })
      }));

      // Find orders assigned to this partner
      const partnerOrders = orders.filter(order => 
        Math.abs(order.pickup_lat - selectedPartner.current_lat) < 0.5 &&
        Math.abs(order.pickup_lng - selectedPartner.current_lng) < 0.5
      );

      const orderFeatures: any[] = partnerOrders.flatMap(order => {
        const features = [];
        
        // Pickup point
        const pickupFeature = new Feature({
          geometry: new Point(fromLonLat([order.pickup_lng, order.pickup_lat])),
          order: order,
          type: 'pickup'
        });

        const pickupSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#22c55e" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">P</text></svg>';

        pickupFeature.setStyle(new Style({
          image: new Icon({
            src: `data:image/svg+xml;utf8,${encodeURIComponent(pickupSvg)}`,
            scale: 1
          }),
          text: new Text({
            text: order.pickup_name,
            font: '10px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            offsetY: -20
          })
        }));

        // Drop point
        const dropFeature = new Feature({
          geometry: new Point(fromLonLat([order.drop_lng, order.drop_lat])),
          order: order,
          type: 'drop'
        });

        const dropSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">D</text></svg>';

        dropFeature.setStyle(new Style({
          image: new Icon({
            src: `data:image/svg+xml;utf8,${encodeURIComponent(dropSvg)}`,
            scale: 1
          }),
          text: new Text({
            text: order.drop_name,
            font: '10px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            offsetY: -20
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

        features.push(pickupFeature, dropFeature, routeFeature);
        return features;
      });

      const vectorSource = new VectorSource({
        features: [partnerFeature, ...orderFeatures]
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource
      });

      mapInstanceRef.current.addLayer(vectorLayer);

      // Center map on selected partner
      mapInstanceRef.current.getView().setCenter(fromLonLat([selectedPartner.current_lng, selectedPartner.current_lat]));
      mapInstanceRef.current.getView().setZoom(10);

      return;
    }

    // Show all partners and orders
    const partnerFeatures = partners.map(partner => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([partner.current_lng, partner.current_lat])),
        partner: partner
      });

      const vehicleIcon = partner.vehicle_type === 'bike' ? '🏍️' : 
                         partner.vehicle_type === 'car' ? '🚗' : '🛵';

      const isInAP = isInAndhraPradesh(partner.current_lat, partner.current_lng);
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="${isInAP ? '#3b82f6' : '#ef4444'}" stroke="white" stroke-width="2"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12">${vehicleIcon}</text></svg>`;

      feature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`,
          scale: 1
        }),
        text: new Text({
          text: partner.location_name || 'Unknown',
          font: '10px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
          offsetY: -25
        })
      }));

      return feature;
    });

    // Create features for orders (pickup and drop points)
    const orderFeatures: any[] = [];
    orders.forEach(order => {
      // Only show orders if pickup/drop is in AP
      const pickupInAP = isInAndhraPradesh(order.pickup_lat, order.pickup_lng);
      const dropInAP = isInAndhraPradesh(order.drop_lat, order.drop_lng);

      if (!pickupInAP && !dropInAP) return; // Skip orders completely outside AP

      // Pickup point
      const pickupFeature = new Feature({
        geometry: new Point(fromLonLat([order.pickup_lng, order.pickup_lat])),
        order: order,
        type: 'pickup'
      });

      const pickupSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${pickupInAP ? '#22c55e' : '#f59e0b'}" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">P</text></svg>`;

      pickupFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,${encodeURIComponent(pickupSvg)}`,
          scale: 1
        })
      }));

      // Drop point
      const dropFeature = new Feature({
        geometry: new Point(fromLonLat([order.drop_lng, order.drop_lat])),
        order: order,
        type: 'drop'
      });

      const dropSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${dropInAP ? '#ef4444' : '#f59e0b'}" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">D</text></svg>`;

      dropFeature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,${encodeURIComponent(dropSvg)}`,
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

      const routeColor = (!pickupInAP || !dropInAP) ? '#f59e0b' : 
                        order.status === 'completed' ? '#22c55e' : 
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

    // Add click interaction for partners
    mapInstanceRef.current.on('singleclick', (evt: any) => {
      const feature = mapInstanceRef.current.forEachFeatureAtPixel(
        evt.pixel,
        (feature: any) => feature
      );

      if (feature && feature.get('partner')) {
        const partner = feature.get('partner');
        setSelectedPartner(partner);
      }
    });
  };

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      // Start simulation - move partners randomly within AP bounds
      const interval = setInterval(() => {
        setPartners(prevPartners => 
          prevPartners.map(partner => {
            // Keep partners roughly in their current area
            const latChange = (Math.random() - 0.5) * 0.01;
            const lngChange = (Math.random() - 0.5) * 0.01;
            const newLat = Math.max(12.5, Math.min(19.5, partner.current_lat + latChange));
            const newLng = Math.max(77.0, Math.min(85.0, partner.current_lng + lngChange));
            
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
      if (selectedPartner) {
        mapInstanceRef.current.getView().setCenter(fromLonLat([selectedPartner.current_lng, selectedPartner.current_lat]));
        mapInstanceRef.current.getView().setZoom(10);
      } else {
        mapInstanceRef.current.getView().setCenter(fromLonLat([79.7400, 15.9129]));
        mapInstanceRef.current.getView().setZoom(7);
      }
    }
  };

  const apPartners = partners.filter(p => isInAndhraPradesh(p.current_lat, p.current_lng));
  const nonApPartners = partners.filter(p => !isInAndhraPradesh(p.current_lat, p.current_lng));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedPartner && !selectedPartnerId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPartner(null)}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to All
                </Button>
              )}
              <MapPin className="w-5 h-5" />
              {selectedPartner 
                ? `${selectedPartner.name} - ${selectedPartner.location_name}`
                : 'Andhra Pradesh Live Map'
              }
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
              <span className="text-sm">AP Delivery Partners ({apPartners.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Outside AP ({nonApPartners.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Pickup Points ({orders.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Out of Range Orders</span>
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
      {!selectedPartner && !selectedPartnerId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map(partner => {
            const inAP = isInAndhraPradesh(partner.current_lat, partner.current_lng);
            return (
              <Card 
                key={partner.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${inAP ? 'border-green-200' : 'border-red-200'}`}
                onClick={() => setSelectedPartner(partner)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{partner.name}</h3>
                    <Truck className={`w-4 h-4 ${inAP ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div className="space-y-1">
                    <Badge variant={inAP ? "default" : "destructive"} className="text-xs">
                      {partner.location_name || 'Unknown Location'}
                    </Badge>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {partner.vehicle_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {partner.status}
                      </Badge>
                    </div>
                    {!inAP && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ No delivery service
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpenLayersMap;
