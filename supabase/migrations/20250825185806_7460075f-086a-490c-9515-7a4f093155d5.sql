
-- Create organizations table for multi-tenancy
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  external_id TEXT NOT NULL,
  pickup_name TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  drop_name TEXT NOT NULL,
  drop_lat DECIMAL(10, 8) NOT NULL,
  drop_lng DECIMAL(11, 8) NOT NULL,
  priority INTEGER DEFAULT 3,
  service_minutes INTEGER DEFAULT 5,
  weight DECIMAL(8, 2) DEFAULT 1.0,
  tw_start TIME,
  tw_end TIME,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, external_id)
);

-- Create delivery_partners table
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bike', 'scooter', 'car', 'van', 'truck')),
  capacity INTEGER DEFAULT 8,
  shift_start TIME DEFAULT '09:00',
  shift_end TIME DEFAULT '18:00',
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert a default organization for demo purposes
INSERT INTO public.organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Organization')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since no auth is implemented yet)
CREATE POLICY "Allow all access to organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all access to delivery_partners" ON public.delivery_partners FOR ALL USING (true);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to uploads bucket
CREATE POLICY "Allow uploads for everyone"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow reading uploads for everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');
