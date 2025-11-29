-- =====================================================
-- BARRELVERSE DATABASE SCHEMA
-- Complete database for spirits collection & trivia platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS
-- =====================================================

-- Spirit categories
CREATE TYPE spirit_category AS ENUM (
  'bourbon', 'scotch', 'irish', 'japanese', 'wine', 'beer',
  'tequila', 'rum', 'gin', 'vodka', 'cognac', 'sake', 'liqueurs'
);

-- Trivia categories (spirit categories + general)
CREATE TYPE trivia_category AS ENUM (
  'bourbon', 'scotch', 'irish', 'japanese', 'wine', 'beer',
  'tequila', 'rum', 'gin', 'vodka', 'cognac', 'sake',
  'general', 'history', 'production', 'brands'
);

-- Difficulty levels
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');

-- Rarity levels
CREATE TYPE rarity_level AS ENUM (
  'common', 'uncommon', 'rare', 'very_rare', 'ultra_rare', 'legendary'
);

-- Game types
CREATE TYPE game_type AS ENUM (
  'quick_pour', 'masters_challenge', 'daily_dram', 'blind_tasting', 'speed_round'
);

-- Experience levels
CREATE TYPE experience_level AS ENUM (
  'beginner', 'intermediate', 'advanced', 'expert', 'master'
);

-- Reward categories
CREATE TYPE reward_category AS ENUM (
  'merchandise', 'experience', 'digital', 'discount', 'exclusive'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
  'earn', 'spend', 'bonus', 'refund', 'transfer_in', 'transfer_out', 'purchase'
);

-- =====================================================
-- PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_spirit TEXT,
  experience_level experience_level DEFAULT 'beginner',
  location TEXT,
  birth_date DATE,
  age_verified BOOLEAN DEFAULT false,
  age_verified_at TIMESTAMPTZ,
  proof_balance INTEGER DEFAULT 0,
  total_proof_earned INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  bottles_collected INTEGER DEFAULT 0,
  reviews_written INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SPIRITS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_spirits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  category spirit_category NOT NULL,
  subcategory TEXT,
  country TEXT,
  region TEXT,
  distillery TEXT,
  proof NUMERIC(5,2),
  abv NUMERIC(5,2),
  age_statement TEXT,
  mash_bill TEXT,
  barrel_type TEXT,
  finish TEXT,
  tasting_notes JSONB DEFAULT '[]'::jsonb,
  flavor_profile JSONB DEFAULT '{}'::jsonb,
  awards JSONB DEFAULT '[]'::jsonb,
  msrp NUMERIC(10,2),
  current_market_price NUMERIC(10,2),
  rarity rarity_level DEFAULT 'common',
  image_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  producer_notes TEXT,
  is_allocated BOOLEAN DEFAULT false,
  is_discontinued BOOLEAN DEFAULT false,
  release_year INTEGER,
  bottle_size TEXT DEFAULT '750ml',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- USER COLLECTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_user_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID NOT NULL REFERENCES bv_spirits(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  purchase_price NUMERIC(10,2),
  purchase_date DATE,
  purchase_location TEXT,
  is_opened BOOLEAN DEFAULT false,
  opened_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  for_trade BOOLEAN DEFAULT false,
  collected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, spirit_id)
);

-- =====================================================
-- TRIVIA QUESTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_trivia_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category trivia_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  image_url TEXT,
  source TEXT,
  proof_reward INTEGER DEFAULT 10,
  times_shown INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- GAME SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES bv_profiles(id) ON DELETE SET NULL,
  game_type game_type NOT NULL,
  category TEXT,
  difficulty TEXT,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  total_proof_earned INTEGER DEFAULT 0,
  time_taken_ms INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TRIVIA PROGRESS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_trivia_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES bv_game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES bv_trivia_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INTEGER,
  proof_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- $PROOF TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_proof_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type transaction_type NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- REWARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category reward_category NOT NULL,
  proof_cost INTEGER NOT NULL,
  image_url TEXT,
  quantity_available INTEGER,
  is_limited BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- USER REWARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES bv_rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending',
  fulfillment_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- LEADERBOARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
  period_start DATE NOT NULL,
  total_proof INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_percent NUMERIC(5,2),
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

-- =====================================================
-- COURSES TABLE (Academy)
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category spirit_category,
  difficulty difficulty_level DEFAULT 'beginner',
  duration_minutes INTEGER,
  lessons JSONB DEFAULT '[]'::jsonb,
  proof_reward INTEGER DEFAULT 50,
  badge_reward TEXT,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- USER COURSE PROGRESS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_user_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES bv_courses(id) ON DELETE CASCADE,
  current_lesson INTEGER DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  quiz_scores JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bv_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES bv_profiles(id) ON DELETE CASCADE,
  spirit_id UUID NOT NULL REFERENCES bv_spirits(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  nose_notes JSONB DEFAULT '[]'::jsonb,
  palate_notes JSONB DEFAULT '[]'::jsonb,
  finish_notes JSONB DEFAULT '[]'::jsonb,
  would_buy_again BOOLEAN,
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, spirit_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_spirits_category ON bv_spirits(category);
CREATE INDEX IF NOT EXISTS idx_spirits_rarity ON bv_spirits(rarity);
CREATE INDEX IF NOT EXISTS idx_spirits_name_trgm ON bv_spirits USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trivia_category ON bv_trivia_questions(category);
CREATE INDEX IF NOT EXISTS idx_trivia_difficulty ON bv_trivia_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_trivia_active ON bv_trivia_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_collection_user ON bv_user_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_spirit ON bv_user_collection(spirit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON bv_proof_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON bv_game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON bv_leaderboards(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_reviews_spirit ON bv_reviews(spirit_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE bv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_trivia_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_proof_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON bv_profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON bv_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON bv_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Spirits: Public read
CREATE POLICY "Spirits are viewable by everyone" ON bv_spirits
  FOR SELECT USING (true);

-- Trivia questions: Public read active questions
CREATE POLICY "Active trivia questions are viewable" ON bv_trivia_questions
  FOR SELECT USING (is_active = true);

-- User collection: Own data only
CREATE POLICY "Users can view own collection" ON bv_user_collection
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collection" ON bv_user_collection
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collection" ON bv_user_collection
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collection" ON bv_user_collection
  FOR DELETE USING (auth.uid() = user_id);

-- Game sessions: Own data only
CREATE POLICY "Users can view own game sessions" ON bv_game_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game sessions" ON bv_game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: Own data only
CREATE POLICY "Users can view own transactions" ON bv_proof_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Reviews: Public read, own write
CREATE POLICY "Reviews are viewable by everyone" ON bv_reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON bv_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON bv_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboards: Public read
CREATE POLICY "Leaderboards are viewable by everyone" ON bv_leaderboards
  FOR SELECT USING (true);

-- Rewards: Public read
CREATE POLICY "Rewards are viewable by everyone" ON bv_rewards
  FOR SELECT USING (is_active = true);

-- Courses: Public read
CREATE POLICY "Courses are viewable by everyone" ON bv_courses
  FOR SELECT USING (is_active = true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON bv_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spirits_updated_at BEFORE UPDATE ON bv_spirits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collection_updated_at BEFORE UPDATE ON bv_user_collection
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trivia_updated_at BEFORE UPDATE ON bv_trivia_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON bv_rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON bv_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON bv_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bv_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to add $PROOF and record transaction
CREATE OR REPLACE FUNCTION add_proof(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update balance
  UPDATE bv_profiles
  SET proof_balance = proof_balance + p_amount,
      total_proof_earned = CASE WHEN p_amount > 0 THEN total_proof_earned + p_amount ELSE total_proof_earned END
  WHERE id = p_user_id
  RETURNING proof_balance INTO v_new_balance;
  
  -- Record transaction
  INSERT INTO bv_proof_transactions (user_id, amount, transaction_type, description, reference_id, reference_type, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, p_reference_type, v_new_balance);
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
