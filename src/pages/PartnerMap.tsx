
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OpenLayersMap from '@/components/OpenLayersMap';

interface DeliveryPartner {
  id: string;
  name: string;
  vehicle_type: string;
  status: string;
  current_lat: number;
  current_lng: number;
  location_name?: string;
}

const PartnerMap = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerData();
  }, [partnerId]);

  const fetchPartnerData = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;
      setPartner(data);
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading partner map...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Partner not found</p>
            <Button onClick={() => navigate('/partners')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partners
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInAP = partner.current_lat >= 12.5 && partner.current_lat <= 19.5 && 
                 partner.current_lng >= 77.0 && partner.current_lng <= 85.0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/partners')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Partners
              </Button>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {partner.name} - Live Route Map
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className={`w-5 h-5 ${isInAP ? 'text-green-600' : 'text-red-600'}`} />
              <Badge variant={isInAP ? "default" : "destructive"}>
                {partner.location_name || 'Unknown Location'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{partner.vehicle_type}</Badge>
              <span className="text-sm text-muted-foreground">Vehicle Type</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={partner.status === 'available' ? 'default' : 'secondary'}>
                {partner.status}
              </Badge>
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isInAP ? 'default' : 'destructive'}>
                {isInAP ? 'Active in AP' : 'Outside Service Area'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Component */}
      <OpenLayersMap selectedPartnerId={partner.id} />
    </div>
  );
};

export default PartnerMap;
