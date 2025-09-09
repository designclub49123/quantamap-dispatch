
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, MapPin, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  drop_address: string;
  drop_lat: number | null;
  drop_lng: number | null;
  status: string;
}

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [markers, setMarkers] = useState<{ [key: string]: L.Marker }>({});

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

      setPartners(partnersData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([19.0760, 72.8777], 12);

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

    // Add partner markers
    partners.forEach(partner => {
      const partnerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
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
          </div>
        `);

      newMarkers[`partner-${partner.id}`] = marker;
    });

    // Add order markers
    orders.forEach(order => {
      // Pickup marker
      const pickupIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
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
             <h3 class="font-semibold">Pickup: ${order.pickup_address}</h3>
             <p class="text-sm text-gray-600">Order: ${order.order_number}</p>
            <p class="text-sm text-gray-600">Status: ${order.status}</p>
          </div>
        `);

      // Drop marker
      const dropIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
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
             <h3 class="font-semibold">Drop: ${order.drop_address}</h3>
             <p class="text-sm text-gray-600">Order: ${order.order_number}</p>
            <p class="text-sm text-gray-600">Status: ${order.status}</p>
          </div>
        `);

      newMarkers[`pickup-${order.id}`] = pickupMarker;
      newMarkers[`drop-${order.id}`] = dropMarker;

      // Draw route line between pickup and drop
      const routeLine = L.polyline([
        [order.pickup_lat, order.pickup_lng],
        [order.drop_lat, order.drop_lng]
      ], {
        color: order.status === 'completed' ? '#22c55e' : order.status === 'assigned' ? '#3b82f6' : '#6b7280',
        weight: 3,
        opacity: 0.7
      }).addTo(map.current!);
    });

    setMarkers(newMarkers);
  }, [partners, orders]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      // Start simulation - move partners randomly
      const interval = setInterval(() => {
        setPartners(prevPartners => 
          prevPartners.map(partner => ({
            ...partner,
            current_lat: partner.current_lat + (Math.random() - 0.5) * 0.001,
            current_lng: partner.current_lng + (Math.random() - 0.5) * 0.001
          }))
        );
      }, 2000);

      // Store interval in a ref or state to clear it later
      setTimeout(() => {
        clearInterval(interval);
        setIsSimulating(false);
      }, 30000); // Stop after 30 seconds
    }
  };

  const resetView = () => {
    if (map.current) {
      map.current.setView([19.0760, 72.8777], 12);
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
              Live Map Controls
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
          <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
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

export default Map;
