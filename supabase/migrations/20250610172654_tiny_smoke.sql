/*
  # Initial BrightMatch Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `age` (integer)
      - `gender` (enum: male, female, non-binary, other)
      - `city`, `state`, `country` (text)
      - `iq_score`, `eq_score` (integer)
      - `interests` (text array)
      - `intent` (enum: dating, friendship)
      - `bio` (text, nullable)
      - `photos` (text array)
      - `profile_completed` (boolean)
      - `last_active` (timestamptz)
      - `created_at`, `updated_at` (timestamptz)

    - `swipes`
      - `id` (uuid, primary key)
      - `swiper_id` (uuid, references users)
      - `swiped_id` (uuid, references users)
      - `direction` (enum: left, right)
      - `created_at` (timestamptz)

    - `matches`
      - `id` (uuid, primary key)
      - `user1_id` (uuid, references users)
      - `user2_id` (uuid, references users)
      - `created_at` (timestamptz)
      - `last_message_at` (timestamptz, nullable)

    - `messages`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `sender_id` (uuid, references users)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for viewing potential matches and messages
*/

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'other');
CREATE TYPE intent_type AS ENUM ('dating', 'friendship');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 99),
  gender gender_type NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'USA',
  iq_score integer DEFAULT 0 CHECK (iq_score >= 0 AND iq_score <= 200),
  eq_score integer DEFAULT 0 CHECK (eq_score >= 0 AND eq_score <= 200),
  interests text[] DEFAULT '{}',
  intent intent_type NOT NULL,
  bio text,
  photos text[] DEFAULT '{}',
  profile_completed boolean DEFAULT false,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view completed profiles for discovery"
  ON users
  FOR SELECT
  TO authenticated
  USING (profile_completed = true);

-- Swipes policies
CREATE POLICY "Users can read own swipes"
  ON swipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = swiper_id);

CREATE POLICY "Users can insert own swipes"
  ON swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
CREATE POLICY "Users can read own matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages policies
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

CREATE POLICY "Users can update messages they sent"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_users_scores ON users(iq_score, eq_score);
CREATE INDEX IF NOT EXISTS idx_users_intent ON users(intent);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();