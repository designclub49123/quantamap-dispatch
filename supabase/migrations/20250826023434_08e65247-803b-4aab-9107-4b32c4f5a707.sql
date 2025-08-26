
-- Update delivery partners to be in Andhra Pradesh cities
UPDATE delivery_partners 
SET 
  name = CASE 
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Rahul Kumar'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Priya Singh'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Amit Patel'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 3) THEN 'Sneha Reddy'
    ELSE name
  END,
  current_lat = CASE 
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 0) THEN 17.6868  -- Visakhapatnam
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 1) THEN 16.2160  -- Guntur
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 2) THEN 15.9129  -- Kurnool
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 3) THEN 13.0827  -- Chennai (outside AP)
    ELSE current_lat
  END,
  current_lng = CASE 
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 0) THEN 83.2185  -- Visakhapatnam
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 1) THEN 80.4549  -- Guntur
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 2) THEN 78.0370  -- Kurnool
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 3) THEN 80.2707  -- Chennai (outside AP)
    ELSE current_lng
  END,
  vehicle_type = CASE 
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'bike'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'scooter'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'car'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 3) THEN 'bike'
    ELSE vehicle_type
  END,
  status = CASE 
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'available'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'busy'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'available'
    WHEN id = (SELECT id FROM delivery_partners ORDER BY created_at LIMIT 1 OFFSET 3) THEN 'delivering'
    ELSE status
  END
WHERE org_id = '00000000-0000-0000-0000-000000000000';

-- Add location_name column to delivery_partners table
ALTER TABLE delivery_partners 
ADD COLUMN IF NOT EXISTS location_name TEXT;

-- Add location_name column to orders table for pickup and drop locations
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS pickup_location TEXT,
ADD COLUMN IF NOT EXISTS drop_location TEXT;

-- Update delivery partners with location names
UPDATE delivery_partners 
SET location_name = CASE 
  WHEN current_lat BETWEEN 17.6 AND 17.8 AND current_lng BETWEEN 83.1 AND 83.3 THEN 'Visakhapatnam'
  WHEN current_lat BETWEEN 16.1 AND 16.3 AND current_lng BETWEEN 80.3 AND 80.5 THEN 'Guntur'
  WHEN current_lat BETWEEN 15.8 AND 16.0 AND current_lng BETWEEN 77.9 AND 78.1 THEN 'Kurnool'
  WHEN current_lat BETWEEN 13.0 AND 13.2 AND current_lng BETWEEN 80.2 AND 80.3 THEN 'Chennai (Outside AP)'
  ELSE 'Unknown Location'
END
WHERE org_id = '00000000-0000-0000-0000-000000000000';

-- Update orders with Andhra Pradesh locations
UPDATE orders 
SET 
  pickup_name = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Visakhapatnam Central'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Guntur Railway Station'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Kurnool Bus Stand'
    ELSE pickup_name
  END,
  drop_name = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Vizianagaram'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Vijayawada'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Anantapur'
    ELSE drop_name
  END,
  pickup_lat = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 17.6868
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 16.2160
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 15.9129
    ELSE pickup_lat
  END,
  pickup_lng = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 83.2185
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 80.4549
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 78.0370
    ELSE pickup_lng
  END,
  drop_lat = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 18.1124
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 16.5062
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 14.6819
    ELSE drop_lat
  END,
  drop_lng = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 83.3953
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 80.6480
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 77.6006
    ELSE drop_lng
  END,
  pickup_location = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Visakhapatnam'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Guntur'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Kurnool'
    ELSE pickup_location
  END,
  drop_location = CASE 
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 0) THEN 'Vizianagaram'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 1) THEN 'Vijayawada'
    WHEN id = (SELECT id FROM orders ORDER BY created_at LIMIT 1 OFFSET 2) THEN 'Anantapur'
    ELSE drop_location
  END
WHERE org_id = '00000000-0000-0000-0000-000000000000';
