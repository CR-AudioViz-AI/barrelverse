-- =====================================================
-- BARRELVERSE PREMIUM FEATURES - DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- Created: December 12, 2025
-- =====================================================

-- 1. SUBSCRIPTIONS TABLE (Premium subscriptions via Stripe)
CREATE TABLE IF NOT EXISTS bv_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'collector', 'connoisseur', 'sommelier')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS bv_price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
    target_price DECIMAL(10,2),
    alert_type TEXT NOT NULL DEFAULT 'below' CHECK (alert_type IN ('below', 'above', 'any_change')),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRICE HISTORY TABLE
CREATE TABLE IF NOT EXISTS bv_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    source TEXT,
    retailer TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. COCKTAIL RECIPES TABLE
CREATE TABLE IF NOT EXISTS bv_cocktails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    instructions TEXT,
    image_url TEXT,
    glass_type TEXT,
    category TEXT,
    is_alcoholic BOOLEAN DEFAULT TRUE,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    prep_time_minutes INTEGER,
    created_by UUID REFERENCES auth.users(id),
    is_official BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COCKTAIL INGREDIENTS TABLE
CREATE TABLE IF NOT EXISTS bv_cocktail_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cocktail_id UUID REFERENCES bv_cocktails(id) ON DELETE CASCADE,
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE SET NULL,
    ingredient_name TEXT NOT NULL,
    amount TEXT,
    unit TEXT,
    is_optional BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

-- 6. ACHIEVEMENTS/BADGES TABLE
CREATE TABLE IF NOT EXISTS bv_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    category TEXT,
    points INTEGER DEFAULT 10,
    requirement_type TEXT,
    requirement_value INTEGER,
    is_secret BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. USER ACHIEVEMENT PROGRESS TABLE
CREATE TABLE IF NOT EXISTS bv_user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES bv_achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 8. AI SOMMELIER CHAT HISTORY
CREATE TABLE IF NOT EXISTS bv_ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DISTILLERIES TABLE
CREATE TABLE IF NOT EXISTS bv_distilleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    founded_year INTEGER,
    country TEXT,
    region TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    website_url TEXT,
    logo_url TEXT,
    image_url TEXT,
    tours_available BOOLEAN DEFAULT FALSE,
    tour_info TEXT,
    is_craft BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DISTILLERY VISITS (Passport Feature)
CREATE TABLE IF NOT EXISTS bv_distillery_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    distillery_id UUID REFERENCES bv_distilleries(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    photos TEXT[],
    UNIQUE(user_id, distillery_id, visited_at::date)
);

-- 11. SOCIAL FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS bv_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- 12. ACTIVITY FEED TABLE
CREATE TABLE IF NOT EXISTS bv_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE SET NULL,
    cocktail_id UUID REFERENCES bv_cocktails(id) ON DELETE SET NULL,
    distillery_id UUID REFERENCES bv_distilleries(id) ON DELETE SET NULL,
    content TEXT,
    metadata JSONB,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS bv_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. FEATURED CONTENT TABLE
CREATE TABLE IF NOT EXISTS bv_featured (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL CHECK (content_type IN ('spirit', 'cocktail', 'distillery', 'collection', 'article')),
    content_id UUID NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. STORE INVENTORY TABLE (Where to Buy)
CREATE TABLE IF NOT EXISTS bv_store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spirit_id UUID REFERENCES bv_spirits(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_url TEXT,
    price DECIMAL(10,2),
    in_stock BOOLEAN DEFAULT TRUE,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    affiliate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON bv_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON bv_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON bv_price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_spirit ON bv_price_alerts(spirit_id);
CREATE INDEX IF NOT EXISTS idx_price_history_spirit ON bv_price_history(spirit_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON bv_price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_cocktails_slug ON bv_cocktails(slug);
CREATE INDEX IF NOT EXISTS idx_cocktail_ingredients_cocktail ON bv_cocktail_ingredients(cocktail_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON bv_user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON bv_ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON bv_ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_distilleries_slug ON bv_distilleries(slug);
CREATE INDEX IF NOT EXISTS idx_distillery_visits_user ON bv_distillery_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON bv_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON bv_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON bv_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON bv_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON bv_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON bv_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_store_inventory_spirit ON bv_store_inventory(spirit_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE bv_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_cocktail_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_distilleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_distillery_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_featured ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_store_inventory ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Subscriptions: Users can only see their own
CREATE POLICY "Users can view own subscription" ON bv_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Price Alerts: Users can manage their own
CREATE POLICY "Users can manage own alerts" ON bv_price_alerts
    FOR ALL USING (auth.uid() = user_id);

-- Price History: Public read
CREATE POLICY "Anyone can read price history" ON bv_price_history
    FOR SELECT USING (true);

-- Cocktails: Public read, authenticated write
CREATE POLICY "Anyone can read cocktails" ON bv_cocktails
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create cocktails" ON bv_cocktails
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Cocktail Ingredients: Public read
CREATE POLICY "Anyone can read ingredients" ON bv_cocktail_ingredients
    FOR SELECT USING (true);

-- Achievements: Public read
CREATE POLICY "Anyone can read achievements" ON bv_achievements
    FOR SELECT USING (true);

-- User Achievements: Users see own, public unlocked
CREATE POLICY "Users can see own achievements" ON bv_user_achievements
    FOR SELECT USING (auth.uid() = user_id OR unlocked_at IS NOT NULL);

-- AI Conversations: Users can only see their own
CREATE POLICY "Users can manage own conversations" ON bv_ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- Distilleries: Public read
CREATE POLICY "Anyone can read distilleries" ON bv_distilleries
    FOR SELECT USING (true);

-- Distillery Visits: Users manage own
CREATE POLICY "Users can manage own visits" ON bv_distillery_visits
    FOR ALL USING (auth.uid() = user_id);

-- Follows: Public read, users manage own
CREATE POLICY "Anyone can read follows" ON bv_follows
    FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON bv_follows
    FOR ALL USING (auth.uid() = follower_id);

-- Activities: Public read (if is_public), users manage own
CREATE POLICY "Anyone can read public activities" ON bv_activities
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create activities" ON bv_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users see own only
CREATE POLICY "Users can manage own notifications" ON bv_notifications
    FOR ALL USING (auth.uid() = user_id);

-- Featured: Public read
CREATE POLICY "Anyone can read featured" ON bv_featured
    FOR SELECT USING (is_active = true);

-- Store Inventory: Public read
CREATE POLICY "Anyone can read inventory" ON bv_store_inventory
    FOR SELECT USING (true);

-- =====================================================
-- SEED DATA: ACHIEVEMENTS
-- =====================================================
INSERT INTO bv_achievements (name, description, icon, category, points, requirement_type, requirement_value, is_secret) VALUES
-- Collection achievements
('First Bottle', 'Add your first bottle to the collection', '🍾', 'collection', 10, 'collection_count', 1, false),
('Shelf Stocker', 'Collect 10 bottles', '📦', 'collection', 25, 'collection_count', 10, false),
('Serious Collector', 'Collect 50 bottles', '🏆', 'collection', 100, 'collection_count', 50, false),
('Master Collector', 'Collect 100 bottles', '👑', 'collection', 250, 'collection_count', 100, false),
('Vault Keeper', 'Collect 500 bottles', '🏰', 'collection', 1000, 'collection_count', 500, false),

-- Category achievements
('Bourbon Trail', 'Collect 10 different bourbons', '🥃', 'category', 50, 'bourbon_count', 10, false),
('Scotch Explorer', 'Collect 10 different scotches', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'category', 50, 'scotch_count', 10, false),
('Rum Runner', 'Collect 10 different rums', '🏴‍☠️', 'category', 50, 'rum_count', 10, false),
('Agave Aficionado', 'Collect 10 tequilas or mezcals', '🌵', 'category', 50, 'agave_count', 10, false),
('Gin Genius', 'Collect 10 different gins', '🫒', 'category', 50, 'gin_count', 10, false),

-- Review achievements
('Critic', 'Write your first tasting note', '📝', 'reviews', 10, 'review_count', 1, false),
('Reviewer', 'Write 10 tasting notes', '✍️', 'reviews', 50, 'review_count', 10, false),
('Connoisseur', 'Write 50 tasting notes', '🎖️', 'reviews', 200, 'review_count', 50, false),

-- Social achievements
('Social Butterfly', 'Follow 10 collectors', '🦋', 'social', 25, 'following_count', 10, false),
('Influencer', 'Get 100 followers', '⭐', 'social', 200, 'follower_count', 100, false),

-- Distillery achievements
('Tourist', 'Visit your first distillery', '🎫', 'distillery', 25, 'visit_count', 1, false),
('Pilgrim', 'Visit 10 distilleries', '🗺️', 'distillery', 100, 'visit_count', 10, false),
('Globetrotter', 'Visit 50 distilleries', '🌍', 'distillery', 500, 'visit_count', 50, false),

-- Special achievements
('Unicorn Hunter', 'Add an ultra-rare bottle to your collection', '🦄', 'special', 100, 'ultra_rare_count', 1, false),
('Whale Watcher', 'Have a collection worth over $10,000', '🐋', 'special', 250, 'collection_value', 10000, true),
('Early Adopter', 'Join BarrelVerse in 2025', '🚀', 'special', 100, 'join_date', 2025, false)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- DONE!
-- =====================================================
SELECT 'Migration complete! Tables created: ' || 
       (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'bv_%')::text;
