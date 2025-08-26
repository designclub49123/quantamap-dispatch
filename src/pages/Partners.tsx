
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Truck, Search, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { isWithinAP } from '@/data/apLocations';
import { toast } from 'sonner';

interface DeliveryPartner {
  id: string;
  name: string;
  vehicle_type: string;
  status: string;
  current_lat: number;
  current_lng: number;
  phone?: string;
  email?: string;
  capacity?: number;
  shift_start?: string;
  shift_end?: string;
  location_name?: string;
}

const Partners = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000')
        .order('name');

      if (error) throw error;

      // Filter partners within AP boundaries
      const validPartners = (data || []).filter(partner => {
        const withinAP = isWithinAP(partner.current_lat, partner.current_lng);
        if (!withinAP) {
          console.warn(`Partner ${partner.name} is outside AP boundaries`);
        }
        return withinAP;
      });

      setPartners(validPartners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to load delivery partners');
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewOnMap = (partnerId: string) => {
    navigate(`/partner-map/${partnerId}`);
  };

  const handlePartnerDetail = (partnerId: string) => {
    navigate(`/partners/${partnerId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[400px] w-full rounded-lg flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading delivery partners...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            Delivery Partners
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and track delivery partners in Andhra Pradesh
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, vehicle type, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{partner.name}</CardTitle>
                <Badge 
                  variant={partner.status === 'available' ? 'default' : 
                          partner.status === 'busy' ? 'destructive' : 'secondary'}
                >
                  {partner.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{partner.vehicle_type}</span>
                  <Badge variant="outline" className="text-xs">
                    Capacity: {partner.capacity || 8}
                  </Badge>
                </div>
                
                {partner.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{partner.phone}</span>
                  </div>
                )}
                
                {partner.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{partner.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{partner.location_name || 'Andhra Pradesh'}</span>
                </div>
                
                {partner.shift_start && partner.shift_end && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {partner.shift_start} - {partner.shift_end}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handlePartnerDetail(partner.id)}
                >
                  View Details
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleViewOnMap(partner.id)}
                >
                  <MapPin className="w-3 h-3" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPartners.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No partners found matching your search.' : 'No delivery partners found in Andhra Pradesh.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Partners Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{partners.length}</div>
              <div className="text-sm text-muted-foreground">Total Partners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {partners.filter(p => p.status === 'available').length}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {partners.filter(p => p.status === 'busy').length}
              </div>
              <div className="text-sm text-muted-foreground">Busy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {partners.filter(p => p.status === 'offline').length}
              </div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Partners;
