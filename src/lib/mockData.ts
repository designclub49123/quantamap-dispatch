// Mock data for development when database is not available
export const mockJobs = [
  {
    id: '1',
    name: 'Morning Route Optimization',
    status: 'completed',
    optimization_type: 'route',
    total_orders: 15,
    assigned_partners: 3,
    total_distance: 45.6,
    estimated_time: 180,
    actual_time: 165,
    cost_savings: 125.50,
    org_id: 'demo_org',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Afternoon Delivery Batch',
    status: 'running',
    optimization_type: 'time',
    total_orders: 8,
    assigned_partners: 2,
    total_distance: 28.3,
    estimated_time: 120,
    actual_time: null,
    cost_savings: null,
    org_id: 'demo_org',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  }
];

export const mockAssignments = [
  {
    id: '1',
    job_id: '1',
    order_id: '1',
    partner_id: '1',
    sequence: 1,
    estimated_arrival: new Date().toISOString(),
    actual_arrival: new Date().toISOString(),
    distance_km: 5.2,
    duration_minutes: 25,
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    orders: {
      id: '1',
      order_number: 'ORD-001',
      customer_name: 'Alice Brown',
      pickup_address: '123 Main St, New York, NY',
      pickup_lat: 40.7128,
      pickup_lng: -74.0060,
      drop_address: '456 Broadway, New York, NY',
      drop_lat: 40.7589,
      drop_lng: -73.9851
    },
    delivery_partners: {
      id: '1',
      name: 'John Smith',
      vehicle_type: 'bike',
      current_lat: 40.7128,
      current_lng: -74.0060
    }
  }
];

export const mockOrders = [
  {
    id: '1',
    order_number: 'ORD-001',
    customer_name: 'Alice Brown',
    pickup_address: '123 Main St, New York, NY',
    pickup_lat: 40.7128,
    pickup_lng: -74.0060,
    drop_address: '456 Broadway, New York, NY',
    drop_lat: 40.7589,
    drop_lng: -73.9851,
    status: 'pending'
  },
  {
    id: '2',
    order_number: 'ORD-002',
    customer_name: 'Bob Wilson',
    pickup_address: '789 5th Ave, New York, NY',
    pickup_lat: 40.7505,
    pickup_lng: -73.9934,
    drop_address: '321 Park Ave, New York, NY',
    drop_lat: 40.7282,
    drop_lng: -73.7949,
    status: 'assigned'
  }
];

export const mockPartners = [
  {
    id: '1',
    name: 'John Smith',
    vehicle_type: 'bike',
    status: 'available',
    current_lat: 40.7128,
    current_lng: -74.0060
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    vehicle_type: 'car',
    status: 'busy',
    current_lat: 40.7589,
    current_lng: -73.9851
  }
];