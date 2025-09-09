-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  optimization_type TEXT NOT NULL DEFAULT 'route' CHECK (optimization_type IN ('route', 'load', 'time')),
  total_orders INTEGER DEFAULT 0,
  assigned_partners INTEGER DEFAULT 0,
  total_distance DECIMAL(10,2),
  estimated_time INTEGER,
  actual_time INTEGER,
  cost_savings DECIMAL(10,2),
  org_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create delivery_partners table
CREATE TABLE public.delivery_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'bike' CHECK (vehicle_type IN ('bike', 'car', 'truck', 'van')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  current_lat DECIMAL(10,6),
  current_lng DECIMAL(10,6),
  capacity INTEGER DEFAULT 10,
  phone TEXT,
  email TEXT,
  org_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,6),
  pickup_lng DECIMAL(10,6),
  drop_address TEXT NOT NULL,
  drop_lat DECIMAL(10,6),
  drop_lng DECIMAL(10,6),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  weight DECIMAL(8,2),
  dimensions TEXT,
  special_instructions TEXT,
  org_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_assignments table
CREATE TABLE public.job_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.delivery_partners(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - can be restricted later with auth)
CREATE POLICY "Allow all operations on jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on delivery_partners" ON public.delivery_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on job_assignments" ON public.job_assignments FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_partners_updated_at
  BEFORE UPDATE ON public.delivery_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_assignments_updated_at
  BEFORE UPDATE ON public.job_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert dummy delivery partners
INSERT INTO public.delivery_partners (name, vehicle_type, status, current_lat, current_lng, capacity, phone, email, org_id) VALUES
('John Smith', 'bike', 'available', 40.7128, -74.0060, 5, '+1234567890', 'john@example.com', 'demo_org'),
('Sarah Johnson', 'car', 'busy', 40.7589, -73.9851, 10, '+1234567891', 'sarah@example.com', 'demo_org'),
('Mike Chen', 'van', 'available', 40.7505, -73.9934, 20, '+1234567892', 'mike@example.com', 'demo_org'),
('Emma Davis', 'truck', 'offline', 40.7282, -73.7949, 50, '+1234567893', 'emma@example.com', 'demo_org'),
('Alex Wilson', 'bike', 'available', 40.7614, -73.9776, 5, '+1234567894', 'alex@example.com', 'demo_org');

-- Insert dummy orders
INSERT INTO public.orders (order_number, customer_name, customer_phone, pickup_address, pickup_lat, pickup_lng, drop_address, drop_lat, drop_lng, status, priority, weight, org_id) VALUES
('ORD-001', 'Alice Brown', '+1555123456', '123 Main St, New York, NY', 40.7128, -74.0060, '456 Broadway, New York, NY', 40.7589, -73.9851, 'pending', 1, 2.5, 'demo_org'),
('ORD-002', 'Bob Wilson', '+1555123457', '789 5th Ave, New York, NY', 40.7505, -73.9934, '321 Park Ave, New York, NY', 40.7282, -73.7949, 'assigned', 2, 1.8, 'demo_org'),
('ORD-003', 'Carol Martinez', '+1555123458', '654 Wall St, New York, NY', 40.7074, -74.0113, '987 Madison Ave, New York, NY', 40.7614, -73.9776, 'picked_up', 1, 3.2, 'demo_org'),
('ORD-004', 'David Lee', '+1555123459', '147 Lexington Ave, New York, NY', 40.7453, -73.9832, '258 3rd Ave, New York, NY', 40.7329, -73.9846, 'delivered', 3, 0.9, 'demo_org'),
('ORD-005', 'Eva Garcia', '+1555123460', '369 Columbus Ave, New York, NY', 40.7851, -73.9749, '741 Amsterdam Ave, New York, NY', 40.7944, -73.9721, 'pending', 1, 4.1, 'demo_org');

-- Insert dummy jobs
INSERT INTO public.jobs (name, status, optimization_type, total_orders, assigned_partners, total_distance, estimated_time, actual_time, cost_savings, org_id) VALUES
('Morning Route Optimization', 'completed', 'route', 15, 3, 45.6, 180, 165, 125.50, 'demo_org'),
('Afternoon Delivery Batch', 'running', 'time', 8, 2, 28.3, 120, null, null, 'demo_org'),
('Evening Express Routes', 'pending', 'route', 12, 0, null, null, null, null, 'demo_org'),
('Weekend Load Optimization', 'completed', 'load', 20, 4, 67.8, 240, 225, 189.75, 'demo_org'),
('Priority Delivery Set', 'failed', 'time', 5, 1, 15.2, 60, null, null, 'demo_org');

-- Insert dummy job assignments
INSERT INTO public.job_assignments (job_id, partner_id, order_id, sequence, distance_km, duration_minutes, status) VALUES
((SELECT id FROM public.jobs WHERE name = 'Morning Route Optimization' LIMIT 1), 
 (SELECT id FROM public.delivery_partners WHERE name = 'John Smith' LIMIT 1),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-001' LIMIT 1), 1, 5.2, 25, 'completed'),
((SELECT id FROM public.jobs WHERE name = 'Afternoon Delivery Batch' LIMIT 1),
 (SELECT id FROM public.delivery_partners WHERE name = 'Sarah Johnson' LIMIT 1),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-002' LIMIT 1), 1, 8.7, 35, 'in_progress'),
((SELECT id FROM public.jobs WHERE name = 'Afternoon Delivery Batch' LIMIT 1),
 (SELECT id FROM public.delivery_partners WHERE name = 'Mike Chen' LIMIT 1),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-003' LIMIT 1), 2, 6.4, 28, 'assigned');