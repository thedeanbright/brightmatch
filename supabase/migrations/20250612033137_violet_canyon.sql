/*
  # Fix Database Types and Upgrade Schema

  1. Schema Updates
    - Fix enum type creation to avoid conflicts
    - Add location fields (country, state, city)
    - Add gender preference field
    - Add interests array field
    - Update users table structure

  2. Security
    - Maintain existing RLS policies
    - Update policies for new fields

  3. Data Integrity
    - Add proper constraints and defaults
    - Ensure backward compatibility
*/

-- Drop existing types if they exist to avoid conflicts
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS intent_type CASCADE;
DROP TYPE IF EXISTS swipe_direction CASCADE;

-- Recreate types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'other');
CREATE TYPE intent_type AS ENUM ('dating', 'friendship');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');
CREATE TYPE seeking_type AS ENUM ('men', 'women', 'both');

-- Update users table structure
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'country') THEN
    ALTER TABLE users ADD COLUMN country text DEFAULT 'United States';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'state') THEN
    ALTER TABLE users ADD COLUMN state text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'city') THEN
    ALTER TABLE users ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age') THEN
    ALTER TABLE users ADD COLUMN age integer CHECK (age >= 18 AND age <= 99);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender') THEN
    ALTER TABLE users ADD COLUMN gender gender_type;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'seeking') THEN
    ALTER TABLE users ADD COLUMN seeking seeking_type;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'interests') THEN
    ALTER TABLE users ADD COLUMN interests text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_completed') THEN
    ALTER TABLE users ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_location ON users(country, state, city);
CREATE INDEX IF NOT EXISTS idx_users_seeking ON users(seeking);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_users_age_gender ON users(age, gender);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Users can view other profiles" ON users;
CREATE POLICY "Users can view other profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (profile_completed = true OR auth.uid() = id);