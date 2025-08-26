
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Truck, Package, MapPin, Clock, TrendingUp, Users, Route, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activePartners: 0,
    completedJobs: 0,
    avgDeliveryTime: 0,
    apPartners: 0,
    nonApPartners: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      // Fetch delivery partners
      const { data: partners } = await supabase
        .from('delivery_partners')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      // Fetch jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      const apPartners = partners?.filter(p => 
        p.current_lat >= 12.5 && p.current_lat <= 19.5 && 
        p.current_lng >= 77.0 && p.current_lng <= 85.0
      ) || [];

      const nonApPartners = partners?.filter(p => 
        !(p.current_lat >= 12.5 && p.current_lat <= 19.5 && 
          p.current_lng >= 77.0 && p.current_lng <= 85.0)
      ) || [];

      setStats({
        totalOrders: orders?.length || 0,
        activePartners: partners?.filter(p => p.status === 'available')?.length || 0,
        completedJobs: jobs?.filter(j => j.status === 'completed')?.length || 0,
        avgDeliveryTime: 28.5, // Mock data
        apPartners: apPartners.length,
        nonApPartners: nonApPartners.length
      });

      // Set recent activities
      setRecentActivities([
        { type: 'order', message: 'New order from Visakhapatnam to Vijayawada', time: '2 mins ago' },
        { type: 'partner', message: 'Rahul Kumar completed delivery in Guntur', time: '5 mins ago' },
        { type: 'job', message: 'Optimization job #80234501 completed successfully', time: '10 mins ago' },
        { type: 'warning', message: 'Sneha Reddy outside service area (Chennai)', time: '15 mins ago' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const chartData = [
    { name: 'Mon', orders: 45, deliveries: 42 },
    { name: 'Tue', orders: 52, deliveries: 48 },
    { name: 'Wed', orders: 38, deliveries: 35 },
    { name: 'Thu', orders: 61, deliveries: 58 },
    { name: 'Fri', orders: 55, deliveries: 52 },
    { name: 'Sat', orders: 67, deliveries: 63 },
    { name: 'Sun', orders: 43, deliveries: 40 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quantum Fleet Optimization</h1>
            <p className="text-primary-foreground/80 mt-1">
              Revolutionary AI-powered dispatch system combining quantum computing with classical optimization for unparalleled route efficiency.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <Button 
            onClick={() => navigate('/upload')}
            variant="secondary" 
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            Upload Orders
          </Button>
          <Button 
            onClick={() => navigate('/jobs')}
            variant="outline" 
            className="gap-2 bg-white/10 border-white/20 hover:bg-white/20"
          >
            <BarChart className="w-4 h-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Partners</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePartners}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +3 online now
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">AP: {stats.apPartners}</Badge>
              <Badge variant="destructive" className="text-xs">Outside: {stats.nonApPartners}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Jobs</CardTitle>
            <Route className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +18% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Delivery Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDeliveryTime}min</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              -8% optimization improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
                <Bar dataKey="deliveries" fill="hsl(var(--chart-2))" name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'partner' ? 'bg-green-500' :
                    activity.type === 'job' ? 'bg-purple-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/map')} 
              className="h-16 flex flex-col gap-2"
              variant="outline"
            >
              <MapPin className="w-5 h-5" />
              View Live Map
            </Button>
            <Button 
              onClick={() => navigate('/partners')} 
              className="h-16 flex flex-col gap-2"
              variant="outline"
            >
              <Truck className="w-5 h-5" />
              Manage Partners
            </Button>
            <Button 
              onClick={() => navigate('/jobs')} 
              className="h-16 flex flex-col gap-2"
              variant="outline"
            >
              <Route className="w-5 h-5" />
              Optimization Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
