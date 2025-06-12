/*
  # Final Schema Fix - Prevent Type Recreation Errors

  1. Schema Updates
    - Use IF NOT EXISTS for all type creation
    - Proper error handling for existing objects
    - Clean final schema without conflicts

  2. Security
    - Maintain all RLS policies
    - Proper storage bucket setup

  3. Data Integrity
    - Ensure no data loss during migration
    - Proper constraints and defaults
*/

-- Step 1: Safe type creation with existence checks
DO $$
BEGIN
  -- Only create types if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'other');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intent_type') THEN
    CREATE TYPE intent_type AS ENUM ('dating', 'friendship');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'swipe_direction') THEN
    CREATE TYPE swipe_direction AS ENUM ('left', 'right');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seeking_type') THEN
    CREATE TYPE seeking_type AS ENUM ('men', 'women', 'both');
  END IF;
END $$;

-- Step 2: Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
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

-- Step 3: Add missing columns to existing users table
DO $$
BEGIN
  -- Add columns that might be missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
    ALTER TABLE users ADD COLUMN email text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'seeking') THEN
    ALTER TABLE users ADD COLUMN seeking seeking_type;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_active') THEN
    ALTER TABLE users ADD COLUMN last_active timestamptz DEFAULT now();
  END IF;
END $$;

-- Step 4: Create other tables if not exists
CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(swiper_id, swiped_id),
  CHECK (swiper_id != swiped_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Step 5: Enable RLS (safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies (with IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own profile') THEN
    CREATE POLICY "Users can read own profile"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view other profiles') THEN
    CREATE POLICY "Users can view other profiles"
      ON users
      FOR SELECT
      TO authenticated
      USING (profile_completed = true OR auth.uid() = id);
  END IF;

  -- Swipes policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'swipes' AND policyname = 'Users can read own swipes') THEN
    CREATE POLICY "Users can read own swipes"
      ON swipes
      FOR SELECT
      TO authenticated
      USING (auth.uid() = swiper_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'swipes' AND policyname = 'Users can insert own swipes') THEN
    CREATE POLICY "Users can insert own swipes"
      ON swipes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = swiper_id);
  END IF;

  -- Matches policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Users can read own matches') THEN
    CREATE POLICY "Users can read own matches"
      ON matches
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'System can create matches') THEN
    CREATE POLICY "System can create matches"
      ON matches
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Users can update own matches') THEN
    CREATE POLICY "Users can update own matches"
      ON matches
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;

  -- Messages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can read messages from their matches') THEN
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages to their matches') THEN
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update messages they sent') THEN
    CREATE POLICY "Users can update messages they sent"
      ON messages
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = sender_id);
  END IF;
END $$;

-- Step 7: Create indexes (safe to run multiple times)
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

-- Step 8: Create functions (replace if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create triggers (safe to recreate)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Auto-create user profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ language plpgsql security definer;

-- Step 11: Create auth trigger (safe to recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 12: Create storage bucket (safe to run multiple times)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-photos', 'profile-photos', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    -- Bucket might already exist, continue
    NULL;
END $$;

-- Step 13: Create storage policies (safe to recreate)
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view all photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Users can upload their own photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile-photos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

  CREATE POLICY "Users can view all photos"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'profile-photos');

  CREATE POLICY "Users can delete their own photos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'profile-photos' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION
  WHEN OTHERS THEN
    -- Storage policies might fail in some environments, continue
    NULL;
END $$;