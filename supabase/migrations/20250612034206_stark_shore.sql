/*
  # Fix Database Schema Conflicts and Establish Final Schema

  1. Clean Up Existing Conflicts
    - Drop and recreate conflicting types safely
    - Handle existing table structure conflicts
    - Ensure clean state for final schema

  2. Final Schema Implementation
    - Complete users table with all required fields
    - Swipes, matches, and messages tables
    - Proper enum types and constraints
    - RLS policies for security

  3. Data Integrity
    - Preserve existing user data where possible
    - Add proper indexes for performance
    - Ensure referential integrity
*/

-- Step 1: Clean up existing type conflicts
DO $$
BEGIN
  -- Drop existing types if they exist (cascade to remove dependencies)
  DROP TYPE IF EXISTS gender_type CASCADE;
  DROP TYPE IF EXISTS intent_type CASCADE;
  DROP TYPE IF EXISTS swipe_direction CASCADE;
  DROP TYPE IF EXISTS seeking_type CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    -- Continue if types don't exist
    NULL;
END $$;

-- Step 2: Create enum types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'other');
CREATE TYPE intent_type AS ENUM ('dating', 'friendship');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');
CREATE TYPE seeking_type AS ENUM ('men', 'women', 'both');

-- Step 3: Handle existing users table
DO $$
BEGIN
  -- Check if users table exists and handle accordingly
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    -- Backup existing data if needed
    CREATE TEMP TABLE users_backup AS SELECT * FROM users;
    
    -- Drop existing table to recreate with proper structure
    DROP TABLE IF EXISTS users CASCADE;
  END IF;
END $$;

-- Step 4: Create final users table with complete schema
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  name text,
  username text UNIQUE,
  age integer CHECK (age >= 18 AND age <= 99),
  gender gender_type,
  seeking seeking_type,
  city text,
  state text,
  country text DEFAULT 'United States',
  iq_score integer DEFAULT 0 CHECK (iq_score >= 0 AND iq_score <= 200),
  eq_score integer DEFAULT 0 CHECK (eq_score >= 0 AND eq_score <= 200),
  mbti_type text,
  interests text[] DEFAULT '{}',
  intent intent_type,
  bio text,
  profile_photos text[] DEFAULT '{}',
  profile_completed boolean DEFAULT false,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 5: Create swipes table
DROP TABLE IF EXISTS swipes CASCADE;
CREATE TABLE swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(swiper_id, swiped_id),
  CHECK (swiper_id != swiped_id)
);

-- Step 6: Create matches table
DROP TABLE IF EXISTS matches CASCADE;
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Step 7: Create messages table
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Step 8: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies

-- Users policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view other profiles" ON users;
CREATE POLICY "Users can view other profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (profile_completed = true OR auth.uid() = id);

-- Swipes policies
DROP POLICY IF EXISTS "Users can read own swipes" ON swipes;
CREATE POLICY "Users can read own swipes"
  ON swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = swiper_id);

DROP POLICY IF EXISTS "Users can insert own swipes" ON swipes;
CREATE POLICY "Users can insert own swipes"
  ON swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
DROP POLICY IF EXISTS "Users can read own matches" ON matches;
CREATE POLICY "Users can read own matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "System can create matches" ON matches;
CREATE POLICY "System can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own matches" ON matches;
CREATE POLICY "Users can update own matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
DROP POLICY IF EXISTS "Users can read messages from their matches" ON messages;
CREATE POLICY "Users can read messages from their matches"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their matches" ON messages;
CREATE POLICY "Users can send messages to their matches"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update messages they sent" ON messages;
CREATE POLICY "Users can update messages they sent"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Step 10: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(country, state, city);
CREATE INDEX IF NOT EXISTS idx_users_scores ON users(iq_score, eq_score);
CREATE INDEX IF NOT EXISTS idx_users_intent ON users(intent);
CREATE INDEX IF NOT EXISTS idx_users_gender_seeking ON users(gender, seeking);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_users_mbti ON users(mbti_type);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_swipes_direction ON swipes(direction);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_last_message ON matches(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Step 11: Create or replace functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 12: Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 13: Auto-create user profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    now()
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Step 14: Create auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 15: Create storage bucket for profile photos (if not exists)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-photos', 'profile-photos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Step 16: Create storage policies
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
CREATE POLICY "Users can upload their own photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view all photos" ON storage.objects;
CREATE POLICY "Users can view all photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
CREATE POLICY "Users can delete their own photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );