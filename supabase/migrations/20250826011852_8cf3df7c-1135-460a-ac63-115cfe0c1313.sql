
-- Create jobs table for optimization jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_orders INTEGER DEFAULT 0,
  assigned_partners INTEGER DEFAULT 0,
  optimization_type TEXT DEFAULT 'route',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create job_assignments table to track which orders are assigned to which partners in a job
CREATE TABLE IF NOT EXISTS public.job_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE CASCADE NOT NULL,
  sequence_order INTEGER NOT NULL,
  estimated_duration INTEGER, -- in minutes
  estimated_distance DECIMAL(8, 2), -- in km
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, order_id)
);

-- Add job_id to orders table to track which job an order belongs to
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id);

-- Add coordinates and current location to delivery_partners
ALTER TABLE public.delivery_partners ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8) DEFAULT 19.0760;
ALTER TABLE public.delivery_partners ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11, 8) DEFAULT 72.8777;
ALTER TABLE public.delivery_partners ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.delivery_partners ADD COLUMN IF NOT EXISTS email TEXT;

-- Create RLS policies for new tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to jobs" ON public.jobs FOR ALL USING (true);
CREATE POLICY "Allow all access to job_assignments" ON public.job_assignments FOR ALL USING (true);

-- Insert some sample data for demo
INSERT INTO public.delivery_partners (org_id, name, vehicle_type, capacity, shift_start, shift_end, status, current_lat, current_lng, phone, email) VALUES
('00000000-0000-0000-0000-000000000000', 'Rahul Kumar', 'bike', 8, '09:00', '18:00', 'available', 19.0760, 72.8777, '+91-9876543210', 'rahul@example.com'),
('00000000-0000-0000-0000-000000000000', 'Priya Singh', 'scooter', 12, '10:00', '19:00', 'busy', 19.0896, 72.8656, '+91-9876543211', 'priya@example.com'),
('00000000-0000-0000-0000-000000000000', 'Amit Patel', 'car', 20, '08:00', '17:00', 'available', 19.1136, 72.8697, '+91-9876543212', 'amit@example.com'),
('00000000-0000-0000-0000-000000000000', 'Sneha Reddy', 'bike', 10, '11:00', '20:00', 'delivering', 19.0330, 72.8570, '+91-9876543213', 'sneha@example.com')
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO public.orders (org_id, external_id, pickup_name, pickup_lat, pickup_lng, drop_name, drop_lat, drop_lng, priority, weight, status) VALUES
('00000000-0000-0000-0000-000000000000', 'ORD-001', 'Restaurant A', 19.0760, 72.8777, 'Customer Location 1', 19.0896, 72.8656, 1, 2.5, 'pending'),
('00000000-0000-0000-0000-000000000000', 'ORD-002', 'Restaurant B', 19.1136, 72.8697, 'Customer Location 2', 19.0330, 72.8570, 2, 1.8, 'pending'),
('00000000-0000-0000-0000-000000000000', 'ORD-003', 'Restaurant C', 19.0500, 72.8500, 'Customer Location 3', 19.1200, 72.9000, 3, 3.2, 'assigned'),
('00000000-0000-0000-0000-000000000000', 'ORD-004', 'Restaurant D', 19.0800, 72.8800, 'Customer Location 4', 19.0400, 72.8400, 1, 1.5, 'completed')
ON CONFLICT DO NOTHING;

-- Insert sample jobs
INSERT INTO public.jobs (org_id, name, status, total_orders, assigned_partners, optimization_type, completed_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Morning Delivery Batch', 'completed', 15, 3, 'route', now() - interval '2 hours'),
('00000000-0000-0000-0000-000000000000', 'Afternoon Rush', 'running', 12, 2, 'route', null),
('00000000-0000-0000-0000-000000000000', 'Evening Orders', 'pending', 8, 0, 'route', null)
ON CONFLICT DO NOTHING;
