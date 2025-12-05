-- =====================================================
-- BARRELVERSE AUTONOMOUS OPERATIONS SCHEMA
-- =====================================================
-- Support System, Content Engine, Self-Healing
-- 
-- Execute in Supabase SQL Editor
-- 
-- Built by Claude + Roy Henderson
-- CR AudioViz AI, LLC - BarrelVerse
-- 2025-12-04
-- =====================================================

-- =====================================================
-- CONTENT FRESHNESS TRACKING ("NEW" badges)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_content_freshness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    is_new BOOLEAN DEFAULT TRUE,
    new_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_type, content_id)
);

CREATE INDEX idx_content_freshness_new ON bv_content_freshness(is_new, new_until);

-- =====================================================
-- CONTENT CHANGELOG (What's New feed)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_content_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    action TEXT NOT NULL, -- created, updated, featured
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_changelog_type ON bv_content_changelog(content_type);
CREATE INDEX idx_content_changelog_date ON bv_content_changelog(created_at DESC);

-- =====================================================
-- SPIRIT SUBMISSIONS (User-submitted spirits)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_spirit_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bv_users(id),
    name TEXT NOT NULL,
    brand TEXT,
    type TEXT,
    distillery TEXT,
    abv DECIMAL(5,2),
    description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- =====================================================
-- SUPPORT TICKETS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bv_users(id),
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'question', 'feedback', 'auto_error')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    error_details JSONB,
    assigned_to TEXT CHECK (assigned_to IN ('javari', 'bot', 'human')),
    resolution TEXT,
    auto_fixed BOOLEAN DEFAULT FALSE,
    occurrence_count INTEGER DEFAULT 1,
    knowledge_article_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    
    -- SLA tracking
    sla_due_at TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_tickets_user ON bv_tickets(user_id);
CREATE INDEX idx_tickets_status ON bv_tickets(status);
CREATE INDEX idx_tickets_priority ON bv_tickets(priority);
CREATE INDEX idx_tickets_type ON bv_tickets(type);
CREATE INDEX idx_tickets_assigned ON bv_tickets(assigned_to);

-- =====================================================
-- TICKET MESSAGES (Conversation thread)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES bv_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'javari', 'bot', 'human')),
    sender_id UUID,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not shown to user
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON bv_ticket_messages(ticket_id);

-- =====================================================
-- ERROR LOG (Automatic error tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_error_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES bv_tickets(id),
    user_id UUID REFERENCES bv_users(id),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    url TEXT,
    user_agent TEXT,
    component TEXT,
    user_action TEXT,
    browser_info JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_log_ticket ON bv_error_log(ticket_id);
CREATE INDEX idx_error_log_type ON bv_error_log(error_type);
CREATE INDEX idx_error_log_date ON bv_error_log(created_at DESC);

-- =====================================================
-- PENDING FIXES (Code fixes awaiting deployment)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_pending_fixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES bv_tickets(id),
    fix_code TEXT NOT NULL,
    error_details JSONB,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'deployed', 'rejected')),
    reviewed_by TEXT,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEATURE REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bv_users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    votes INTEGER DEFAULT 1,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'planned', 'in_progress', 'completed', 'declined')),
    admin_response TEXT,
    ai_analysis JSONB,
    target_release TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_requests_status ON bv_feature_requests(status);
CREATE INDEX idx_feature_requests_votes ON bv_feature_requests(votes DESC);

-- =====================================================
-- FEATURE VOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_feature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL REFERENCES bv_feature_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES bv_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

-- =====================================================
-- KNOWLEDGE BASE ARTICLES
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    related_articles UUID[] DEFAULT '{}',
    source_ticket_id UUID REFERENCES bv_tickets(id),
    is_published BOOLEAN DEFAULT TRUE,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_articles_category ON bv_knowledge_articles(category);
CREATE INDEX idx_knowledge_articles_search ON bv_knowledge_articles USING gin(search_vector);
CREATE INDEX idx_knowledge_articles_tags ON bv_knowledge_articles USING gin(tags);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_search_update
    BEFORE INSERT OR UPDATE ON bv_knowledge_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_search_vector();

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bv_users(id), -- NULL for system notifications
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON bv_notifications(user_id, read);
CREATE INDEX idx_notifications_date ON bv_notifications(created_at DESC);

-- =====================================================
-- EMAIL QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_address TEXT NOT NULL,
    template TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON bv_email_queue(status);

-- =====================================================
-- PUSH SUBSCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bv_users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- =====================================================
-- SYSTEM LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_logs_event ON bv_system_logs(event);
CREATE INDEX idx_system_logs_severity ON bv_system_logs(severity);
CREATE INDEX idx_system_logs_time ON bv_system_logs(timestamp DESC);

-- =====================================================
-- HEALTH CHECKS
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    healthy BOOLEAN NOT NULL,
    issues TEXT[] DEFAULT '{}',
    response_times JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_time ON bv_health_checks(timestamp DESC);

-- =====================================================
-- COURSES & LESSONS (for auto-generation)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    learning_outcomes TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    lesson_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bv_course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES bv_courses(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    key_points TEXT[] DEFAULT '{}',
    quiz_question JSONB,
    video_url TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_lessons_course ON bv_course_lessons(course_id, order_index);

-- =====================================================
-- MUSEUM ARTIFACTS (for auto-generation)
-- =====================================================
CREATE TABLE IF NOT EXISTS bv_museum_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    era TEXT,
    description TEXT NOT NULL,
    historical_significance TEXT,
    fun_facts TEXT[] DEFAULT '{}',
    related_spirits TEXT[] DEFAULT '{}',
    image_url TEXT,
    image_prompt TEXT,
    wing_id TEXT,
    exhibit_order INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_museum_artifacts_type ON bv_museum_artifacts(type);
CREATE INDEX idx_museum_artifacts_wing ON bv_museum_artifacts(wing_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Increment error occurrence count
CREATE OR REPLACE FUNCTION increment_error_count(ticket_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE bv_tickets 
    SET occurrence_count = occurrence_count + 1,
        updated_at = NOW()
    WHERE id = ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Increment article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE bv_knowledge_articles 
    SET view_count = view_count + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Increment article helpful count
CREATE OR REPLACE FUNCTION increment_article_helpful(article_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE bv_knowledge_articles 
    SET helpful_count = helpful_count + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED KNOWLEDGE BASE ARTICLES
-- =====================================================
INSERT INTO bv_knowledge_articles (title, content, category, tags) VALUES
('How to add a bottle to your collection', 
 'Adding a bottle to your BarrelVerse collection is easy!\n\n1. Click the "Add Bottle" button on your collection page\n2. Search for your spirit by name, brand, or scan the barcode\n3. If found, click to add it to your collection\n4. Set the purchase date, price, and any notes\n5. Save!\n\nIf your bottle isn''t in our database, you can submit it for review and we''ll add it within 24 hours.',
 'Getting Started',
 ARRAY['collection', 'bottles', 'add', 'getting started']),

('Understanding your subscription tiers',
 'BarrelVerse offers several subscription options:\n\n**Collector (Free)**\n- Track up to 25 bottles\n- Basic trivia access\n- Museum viewing\n\n**Connoisseur ($9.99/mo)**\n- Unlimited bottles\n- Full marketplace access\n- All trivia and games\n- AI-powered recommendations\n\n**Master Distiller ($24.99/mo)**\n- Everything in Connoisseur\n- Auction hosting\n- Featured profile\n- White-glove support',
 'Account & Billing',
 ARRAY['subscription', 'pricing', 'premium', 'upgrade']),

('How to play trivia games',
 'Test your spirits knowledge with our trivia games!\n\n1. Go to the Games section\n2. Choose your category (Bourbon, Scotch, History, etc.)\n3. Select difficulty level\n4. Answer 10 questions\n5. Earn XP and $PROOF tokens for correct answers!\n\n**Pro Tips:**\n- Play daily to maintain your streak\n- Get 10/10 for bonus rewards\n- Compete on the leaderboard',
 'Games & Features',
 ARRAY['trivia', 'games', 'play', 'rewards']),

('Marketplace buying and selling guide',
 'Buy and sell spirits in the BarrelVerse Marketplace!\n\n**To Sell:**\n1. Go to Marketplace > Sell\n2. Select bottle from your collection\n3. Set price, condition, and photos\n4. Publish listing\n\n**To Buy:**\n1. Browse listings\n2. Check seller ratings\n3. Click "Buy Now" or make an offer\n4. Complete payment via Stripe\n\nPlatform fee: 5% (paid by seller)',
 'Marketplace',
 ARRAY['marketplace', 'buy', 'sell', 'trading']),

('Earning and using $PROOF tokens',
 '$PROOF is BarrelVerse''s reward currency!\n\n**How to Earn:**\n- Daily logins: 10 $PROOF\n- Trivia correct answers: 5 $PROOF each\n- Achievements: 25-1000 $PROOF\n- Referrals: 100 $PROOF per signup\n\n**How to Spend:**\n- Marketplace discounts\n- Premium features\n- Exclusive content\n- Special events',
 'Rewards',
 ARRAY['proof', 'tokens', 'rewards', 'earn']);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE bv_content_freshness ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_content_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_spirit_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_museum_artifacts ENABLE ROW LEVEL SECURITY;

-- Public read for content
CREATE POLICY content_freshness_read ON bv_content_freshness FOR SELECT USING (true);
CREATE POLICY content_changelog_read ON bv_content_changelog FOR SELECT USING (true);
CREATE POLICY knowledge_articles_read ON bv_knowledge_articles FOR SELECT USING (is_published = true);
CREATE POLICY courses_read ON bv_courses FOR SELECT USING (is_published = true);
CREATE POLICY course_lessons_read ON bv_course_lessons FOR SELECT USING (true);
CREATE POLICY museum_artifacts_read ON bv_museum_artifacts FOR SELECT USING (true);

-- Users can read their own tickets and notifications
CREATE POLICY tickets_select ON bv_tickets FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY notifications_select ON bv_notifications FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can create tickets and feature requests
CREATE POLICY tickets_insert ON bv_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY feature_requests_insert ON bv_feature_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY service_all ON bv_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_notif ON bv_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY service_all_errors ON bv_error_log FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'bv_tickets' as table_name, COUNT(*) as rows FROM bv_tickets
UNION ALL SELECT 'bv_knowledge_articles', COUNT(*) FROM bv_knowledge_articles
UNION ALL SELECT 'bv_courses', COUNT(*) FROM bv_courses
UNION ALL SELECT 'bv_notifications', COUNT(*) FROM bv_notifications
UNION ALL SELECT 'bv_content_freshness', COUNT(*) FROM bv_content_freshness;

SELECT '✅ AUTONOMOUS OPERATIONS TABLES CREATED!' as status;
SELECT '🤖 Support, Content Engine, Self-Healing READY!' as message;
