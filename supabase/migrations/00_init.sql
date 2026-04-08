-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cars table (API-synced data) - Enhanced EV Schema
CREATE TABLE IF NOT EXISTS cars (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id text UNIQUE NOT NULL,
  name text NOT NULL,
  manufacturer text NOT NULL,
  model_year integer,
  type text,
  
  -- Performance & Range
  range_km integer,
  battery_kwh numeric,
  efficiency_wh_km numeric,
  acceleration_0_100 numeric,
  top_speed_kmh integer,
  
  -- Pricing
  price_usd numeric,
  
  -- Charging
  charging_time_hours numeric,
  charging_ports jsonb DEFAULT '[]'::jsonb,
  
  -- Specifications
  seating_capacity integer,
  drivetrain_type text,
  transmission_type text DEFAULT 'Single-speed',
  doors integer,
  
  -- Features & Certifications
  warranty_years integer,
  wheelchair_accessible boolean DEFAULT false,
  co2_grams_per_km numeric DEFAULT 0,
  
  -- Media & Details
  image_url text,
  specs jsonb,
  available_from text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table (for cars)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table (bookmarks)
CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cars policies
CREATE POLICY "Cars are viewable by everyone" ON cars FOR SELECT USING (true);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Insert initial EV data (Enhanced)
INSERT INTO cars (api_id, name, manufacturer, model_year, type, range_km, battery_kwh, efficiency_wh_km, price_usd, acceleration_0_100, top_speed_kmh, charging_time_hours, charging_ports, seating_capacity, drivetrain_type, doors, warranty_years, image_url, available_from, specs) VALUES
('tesla-model-3-2024', 'Model 3', 'Tesla', 2024, 'Sedan', 547, 82, 150, 43990, 3.1, 225, 0.50, '["Tesla Supercharger", "Type 2"]'::jsonb, 5, 'RWD', 4, 8, 'https://images.unsplash.com/photo-1560958089-b8a63019b94f?w=500&h=500&fit=crop', '2024-01-01', '{"transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('tesla-model-y-2024', 'Model Y', 'Tesla', 2024, 'SUV', 575, 95, 165, 52990, 2.9, 217, 0.45, '["Tesla Supercharger", "Type 2"]'::jsonb, 5, 'RWD', 5, 8, 'https://images.unsplash.com/photo-1560958089-b8a63019b94f?w=500&h=500&fit=crop', '2024-01-01', '{"transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('bmw-i7-2024', 'i7', 'BMW', 2024, 'Sedan', 628, 120, 191, 83250, 3.9, 240, 0.55, '["CCS", "Type 2"]'::jsonb, 5, 'AWD', 4, 8, 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=500&fit=crop', '2024-03-01', '{"transmission": "Single-speed", "drivetrain": "AWD"}'::jsonb),
('ford-mustang-mach-e-2024', 'Mustang Mach-E', 'Ford', 2024, 'SUV', 520, 91, 175, 44995, 4.2, 211, 0.60, '["CCS", "Type 2"]'::jsonb, 5, 'RWD', 5, 8, 'https://images.unsplash.com/photo-1606611013016-969c19d4a42f?w=500&h=500&fit=crop', '2024-02-01', '{"transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('hyundai-ioniq-6-2024', 'IONIQ 6', 'Hyundai', 2024, 'Sedan', 614, 84, 137, 34850, 4.1, 210, 0.52, '["CCS", "Type 2"]'::jsonb, 5, 'RWD', 4, 8, 'https://images.unsplash.com/photo-1535732066927-ab7c9ab60908?w=500&h=500&fit=crop', '2024-01-15', '{"transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('lucid-air-2024', 'Air', 'Lucid', 2024, 'Sedan', 700, 111, 158, 69900, 2.5, 270, 0.48, '["CCS", "Type 2"]'::jsonb, 5, 'RWD', 4, 8, 'https://images.unsplash.com/photo-1579274455760-dcf744ed6257?w=500&h=500&fit=crop', '2024-01-01', '{"transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('polestar-3-2024', '3', 'Polestar', 2024, 'SUV', 573, 111, 194, 73900, 3.8, 230, 0.58, '["CCS", "Type 2"]'::jsonb, 5, 'AWD', 5, 8, 'https://images.unsplash.com/photo-1609843900152-e81766014620?w=500&h=500&fit=crop', '2024-02-15', '{"transmission": "Single-speed", "drivetrain": "AWD"}'::jsonb),
('mercedes-eqe-2024', 'EQE', 'Mercedes-Benz', 2024, 'Sedan', 453, 90, 199, 68500, 4.1, 200, 0.63, '["CCS", "Type 2"]'::jsonb, 5, 'RWD', 4, 8, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&h=500&fit=crop', '2024-01-01', '{"transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('chevrolet-bolt-ev-2024', 'Bolt EV', 'Chevrolet', 2024, 'Hatchback', 417, 85, 204, 26500, 5.2, 200, 0.90, '["CCS", "Type 2"]'::jsonb, 5, 'FWD', 5, 8, 'https://images.unsplash.com/photo-1624521151712-f3b3c550f57b?w=500&h=500&fit=crop', '2024-01-01', '{"transmission": "Single-speed", "drivetrain": "FWD"}'::jsonb),
('rivian-r1t-2024', 'R1T', 'Rivian', 2024, 'Truck', 660, 165, 250, 71490, 4.5, 205, 0.65, '["CCS", "Type 2"]'::jsonb, 5, 'AWD', 4, 8, 'https://images.unsplash.com/photo-1627454829686-d8e8a4e1f5f5?w=500&h=500&fit=crop', '2023-09-01', '{"transmission": "Single-speed", "drivetrain": "AWD"}'::jsonb);
