
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Truck, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DeliveryPartner {
  id: string;
  name: string;
  vehicle_type: string;
  status: string;
  current_lat: number;
  current_lng: number;
  location_name?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  shift_start?: string;
  shift_end?: string;
}

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInAndhraPradesh = (lat: number, lng: number): boolean => {
    return lat >= 12.5 && lat <= 19.5 && lng >= 77.0 && lng <= 85.0;
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || partner.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const apPartners = filteredPartners.filter(p => isInAndhraPradesh(p.current_lat, p.current_lng));
  const nonApPartners = filteredPartners.filter(p => !isInAndhraPradesh(p.current_lat, p.current_lng));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading partners...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-success-gradient rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            Delivery Partners
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your delivery fleet across Andhra Pradesh
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Partners</p>
                <p className="text-2xl font-bold">{partners.length}</p>
              </div>
              <Truck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {partners.filter(p => p.status === 'available').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In AP Region</p>
                <p className="text-2xl font-bold text-blue-600">{apPartners.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outside AP</p>
                <p className="text-2xl font-bold text-red-600">{nonApPartners.length}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search partners by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'available' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('available')}
                size="sm"
              >
                Available
              </Button>
              <Button
                variant={filterStatus === 'busy' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('busy')}
                size="sm"
              >
                Busy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => {
          const inAP = isInAndhraPradesh(partner.current_lat, partner.current_lng);
          
          return (
            <Card 
              key={partner.id} 
              className={`transition-all hover:shadow-md ${inAP ? 'border-green-200' : 'border-red-200'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <Truck className={`w-5 h-5 ${inAP ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={inAP ? "default" : "destructive"} className="text-xs">
                    {partner.location_name || 'Unknown Location'}
                  </Badge>
                  {!inAP && (
                    <Badge variant="destructive" className="text-xs">
                      No Service
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <Badge variant="outline">{partner.vehicle_type}</Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={partner.status === 'available' ? 'default' : 'secondary'}>
                    {partner.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span>{partner.capacity || 8} orders</span>
                </div>
                
                {partner.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{partner.phone}</span>
                  </div>
                )}
                
                {partner.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span>{partner.email}</span>
                  </div>
                )}
                
                {partner.shift_start && partner.shift_end && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{partner.shift_start} - {partner.shift_end}</span>
                  </div>
                )}
                
                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/partners/${partner.id}`)}
                    className="flex-1 gap-2"
                  >
                    <Eye className="w-3 h-3" />
                    Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/partners/${partner.id}/map`)}
                    className="flex-1 gap-2"
                  >
                    <MapPin className="w-3 h-3" />
                    View on Map
                  </Button>
                </div>
                
                {!inAP && (
                  <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
                    ⚠️ Partner is outside Andhra Pradesh service area
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No partners found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first delivery partner.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Partners;
