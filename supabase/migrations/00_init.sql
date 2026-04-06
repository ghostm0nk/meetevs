-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cars table (API-synced data)
CREATE TABLE IF NOT EXISTS cars (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id text UNIQUE NOT NULL,
  name text NOT NULL,
  manufacturer text NOT NULL,
  model_year integer,
  type text,
  range_km integer,
  battery_kwh numeric,
  price_usd numeric,
  acceleration_0_100 numeric,
  top_speed_kmh integer,
  image_url text,
  specs jsonb,
  available_from text,
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

-- Insert initial EV data
INSERT INTO cars (api_id, name, manufacturer, model_year, type, range_km, battery_kwh, price_usd, acceleration_0_100, top_speed_kmh, image_url, available_from, specs) VALUES
('tesla-model-3-2024', 'Model 3', 'Tesla', 2024, 'Sedan', 547, 82, 43990, 3.1, 225, 'https://images.unsplash.com/photo-1560958089-b8a63019b94f?w=500&h=500&fit=crop', '2024-01-01', '{"seats": 5, "doors": 4, "transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('tesla-model-y-2024', 'Model Y', 'Tesla', 2024, 'SUV', 575, 95, 52990, 2.9, 217, 'https://images.unsplash.com/photo-1560958089-b8a63019b94f?w=500&h=500&fit=crop', '2024-01-01', '{"seats": 5, "doors": 5, "transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('bmw-i7-2024', 'i7', 'BMW', 2024, 'Sedan', 628, 120, 83250, 3.9, 240, 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=500&fit=crop', '2024-03-01', '{"seats": 5, "doors": 4, "transmission": "Single-speed", "drivetrain": "AWD"}'::jsonb),
('ford-mustang-mach-e-2024', 'Mustang Mach-E', 'Ford', 2024, 'SUV', 520, 91, 44995, 4.2, 211, 'https://images.unsplash.com/photo-1606611013016-969c19d4a42f?w=500&h=500&fit=crop', '2024-02-01', '{"seats": 5, "doors": 5, "transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('hyundai-ioniq-6-2024', 'IONIQ 6', 'Hyundai', 2024, 'Sedan', 614, 84, 34850, 4.1, 210, 'https://images.unsplash.com/photo-1535732066927-ab7c9ab60908?w=500&h=500&fit=crop', '2024-01-15', '{"seats": 5, "doors": 4, "transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('lucid-air-2024', 'Air', 'Lucid', 2024, 'Sedan', 700, 111, 69900, 2.5, 270, 'https://images.unsplash.com/photo-1579274455760-dcf744ed6257?w=500&h=500&fit=crop', '2024-01-01', '{"seats": 5, "doors": 4, "transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('polestar-3-2024', '3', 'Polestar', 2024, 'SUV', 573, 111, 73900, 3.8, 230, 'https://images.unsplash.com/photo-1609843900152-e81766014620?w=500&h=500&fit=crop', '2024-02-15', '{"seats": 5, "doors": 5, "transmission": "Single-speed", "drivetrain": "AWD"}'::jsonb),
('mercedes-eqe-2024', 'EQE', 'Mercedes-Benz', 2024, 'Sedan', 453, 90, 68500, 4.1, 200, 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&h=500&fit=crop', '2024-01-01', '{"seats": 5, "doors": 4, "transmission": "Single-speed", "drivetrain": "RWD"}'::jsonb),
('chevrolet-bolt-ev-2024', 'Bolt EV', 'Chevrolet', 2024, 'Hatchback', 417, 85, 26500, 5.2, 200, 'https://images.unsplash.com/photo-1624521151712-f3b3c550f57b?w=500&h=500&fit=crop', '2024-01-01', '{"seats": 5, "doors": 5, "transmission": "Single-speed", "drivetrain": "FWD"}'::jsonb),
('rivian-r1t-2024', 'R1T', 'Rivian', 2024, 'Truck', 660, 165, 71490, 4.5, 205, 'https://images.unsplash.com/photo-1627454829686-d8e8a4e1f5f5?w=500&h=500&fit=crop', '2023-09-01', '{"seats": 5, "doors": 4, "transmission": "Single-speed", "drivetrain": "AWD"}'::jsonb);
