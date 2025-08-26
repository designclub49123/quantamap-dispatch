import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, MapPin, Truck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [markers, setMarkers] = useState<{ [key: string]: L.Marker }>({});
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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

      // Filter to only show AP partners and AP orders
      const apPartners = partnersData?.filter(p => isInAndhraPradesh(p.current_lat, p.current_lng)) || [];
      const apOrders = ordersData?.filter(o => 
        isInAndhraPradesh(o.pickup_lat, o.pickup_lng) || isInAndhraPradesh(o.drop_lat, o.drop_lng)
      ) || [];

      setPartners(apPartners);
      setOrders(apOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const isInAndhraPradesh = (lat: number, lng: number): boolean => {
    // Rough bounds of Andhra Pradesh
    return lat >= 12.5 && lat <= 19.5 && lng >= 77.0 && lng <= 85.0;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map centered on Andhra Pradesh
    map.current = L.map(mapContainer.current).setView([15.9129, 79.7400], 7);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markers).forEach(marker => marker.remove());
    const newMarkers: { [key: string]: L.Marker } = {};

    if (selectedPartner) {
      // Show only selected partner and their orders
      const inAP = isInAndhraPradesh(selectedPartner.current_lat, selectedPartner.current_lng);
      const partnerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-${inAP ? 'green' : 'red'}-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold border-3 border-white shadow-lg">
            ${selectedPartner.vehicle_type === 'bike' ? '🏍️' : selectedPartner.vehicle_type === 'car' ? '🚗' : '🛵'}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([selectedPartner.current_lat, selectedPartner.current_lng], { icon: partnerIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${selectedPartner.name}</h3>
            <p class="text-sm text-gray-600">${selectedPartner.vehicle_type} • ${selectedPartner.status}</p>
            <p class="text-sm ${inAP ? 'text-green-600' : 'text-red-600'}">${selectedPartner.location_name || 'Unknown Location'}</p>
            ${!inAP ? '<p class="text-xs text-red-600 font-bold">⚠️ No delivery service outside AP</p>' : ''}
          </div>
        `);

      newMarkers[`partner-${selectedPartner.id}`] = marker;

      // Center map on selected partner
      map.current.setView([selectedPartner.current_lat, selectedPartner.current_lng], 10);
    } else {
      // Show all partners with "View on Map" buttons
      partners.forEach(partner => {
        const inAP = isInAndhraPradesh(partner.current_lat, partner.current_lng);
        const partnerIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="bg-${inAP ? 'blue' : 'red'}-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg cursor-pointer">
              ${partner.vehicle_type === 'bike' ? '🏍️' : partner.vehicle_type === 'car' ? '🚗' : '🛵'}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([partner.current_lat, partner.current_lng], { icon: partnerIcon })
          .addTo(map.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${partner.name}</h3>
              <p class="text-sm text-gray-600">${partner.vehicle_type} • ${partner.status}</p>
              <p class="text-sm ${inAP ? 'text-green-600' : 'text-red-600'}">${partner.location_name || 'Unknown Location'}</p>
              ${!inAP ? '<p class="text-xs text-red-600 font-bold">⚠️ No delivery service</p>' : ''}
              <button onclick="window.viewPartnerMap('${partner.id}')" class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">View on Map</button>
              <button onclick="window.selectPartner('${partner.id}')" class="mt-2 ml-1 px-2 py-1 bg-green-500 text-white text-xs rounded">View Details</button>
            </div>
          `);

        newMarkers[`partner-${partner.id}`] = marker;
      });
    }

    // Add order markers
    orders.forEach(order => {
      const pickupInAP = isInAndhraPradesh(order.pickup_lat, order.pickup_lng);
      const dropInAP = isInAndhraPradesh(order.drop_lat, order.drop_lng);

      // Skip orders completely outside AP unless viewing specific partner
      if (!selectedPartner && !pickupInAP && !dropInAP) return;

      // Pickup marker
      const pickupIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-${pickupInAP ? 'green' : 'orange'}-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
            P
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const pickupMarker = L.marker([order.pickup_lat, order.pickup_lng], { icon: pickupIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">Pickup: ${order.pickup_name}</h3>
            <p class="text-sm text-gray-600">Order: ${order.external_id}</p>
            <p class="text-sm text-gray-600">Status: ${order.status}</p>
            <p class="text-sm ${pickupInAP ? 'text-green-600' : 'text-orange-600'}">${order.pickup_location || 'Unknown Location'}</p>
          </div>
        `);

      // Drop marker
      const dropIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-${dropInAP ? 'red' : 'orange'}-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
            D
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const dropMarker = L.marker([order.drop_lat, order.drop_lng], { icon: dropIcon })
        .addTo(map.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">Drop: ${order.drop_name}</h3>
            <p class="text-sm text-gray-600">Order: ${order.external_id}</p>
            <p class="text-sm text-gray-600">Status: ${order.status}</p>
            <p class="text-sm ${dropInAP ? 'text-green-600' : 'text-orange-600'}">${order.drop_location || 'Unknown Location'}</p>
          </div>
        `);

      newMarkers[`pickup-${order.id}`] = pickupMarker;
      newMarkers[`drop-${order.id}`] = dropMarker;

      // Draw route line between pickup and drop
      const routeColor = (!pickupInAP || !dropInAP) ? '#f59e0b' :
                        order.status === 'completed' ? '#22c55e' : 
                        order.status === 'assigned' ? '#3b82f6' : '#6b7280';

      const routeLine = L.polyline([
        [order.pickup_lat, order.pickup_lng],
        [order.drop_lat, order.drop_lng]
      ], {
        color: routeColor,
        weight: 3,
        opacity: 0.7
      }).addTo(map.current!);
    });

    setMarkers(newMarkers);

    // Add global functions for partner selection and map viewing
    (window as any).selectPartner = (partnerId: string) => {
      const partner = partners.find(p => p.id === partnerId);
      if (partner) {
        setSelectedPartner(partner);
      }
    };

    (window as any).viewPartnerMap = (partnerId: string) => {
      navigate(`/partners/${partnerId}/map`);
    };
  }, [partners, orders, selectedPartner, navigate]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      // Start simulation - move partners randomly within AP bounds
      const interval = setInterval(() => {
        setPartners(prevPartners => 
          prevPartners.map(partner => {
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
      }, 2000);

      // Stop after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        setIsSimulating(false);
      }, 30000);
    }
  };

  const resetView = () => {
    if (map.current) {
      if (selectedPartner) {
        map.current.setView([selectedPartner.current_lat, selectedPartner.current_lng], 10);
      } else {
        map.current.setView([15.9129, 79.7400], 7);
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
              {selectedPartner && (
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
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </Button>
              <Button variant="outline" onClick={resetView} className="gap-2">
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
              <span className="text-sm">AP Partners ({apPartners.length})</span>
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
              <span className="text-sm">Out of Range</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Partner Status */}
      {!selectedPartner && (
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

export default Map;
