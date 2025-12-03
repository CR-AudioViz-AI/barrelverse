-- ============================================
-- BARRELVERSE HISTORY TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- History Articles Table
CREATE TABLE IF NOT EXISTS bv_history_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'BarrelVerse Research Team',
  reading_time_minutes INTEGER DEFAULT 5,
  image_url TEXT,
  sources JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- History Timeline Table
CREATE TABLE IF NOT EXISTS bv_history_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER,
  day INTEGER,
  era TEXT NOT NULL DEFAULT 'modern', -- ancient, medieval, colonial, industrial, prohibition, modern
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- bourbon, scotch, wine, beer, general
  location TEXT,
  significance TEXT DEFAULT 'minor', -- minor, moderate, major, critical
  sources TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base Table (for Javari AI)
CREATE TABLE IF NOT EXISTS bv_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  confidence FLOAT DEFAULT 1.0,
  sources JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto Imports Log Table (for automation tracking)
CREATE TABLE IF NOT EXISTS bv_auto_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  import_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  records_added INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  config JSONB DEFAULT '{}',
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cocktail Recipes Table
CREATE TABLE IF NOT EXISTS bv_cocktail_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_spirit TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  garnish TEXT,
  glassware TEXT,
  difficulty TEXT DEFAULT 'easy',
  prep_time_minutes INTEGER DEFAULT 5,
  flavor_profile TEXT[],
  origin TEXT,
  is_classic BOOLEAN DEFAULT false,
  image_url TEXT,
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distillery Profiles Table
CREATE TABLE IF NOT EXISTS bv_distilleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  region TEXT,
  founded_year INTEGER,
  description TEXT,
  history TEXT,
  production_capacity TEXT,
  notable_products TEXT[],
  tours_available BOOLEAN DEFAULT false,
  website_url TEXT,
  latitude FLOAT,
  longitude FLOAT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bv_history_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_history_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_auto_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_cocktail_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bv_distilleries ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for history articles" ON bv_history_articles FOR SELECT USING (true);
CREATE POLICY "Public read access for history timeline" ON bv_history_timeline FOR SELECT USING (true);
CREATE POLICY "Public read access for knowledge base" ON bv_knowledge_base FOR SELECT USING (true);
CREATE POLICY "Public read access for cocktail recipes" ON bv_cocktail_recipes FOR SELECT USING (true);
CREATE POLICY "Public read access for distilleries" ON bv_distilleries FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access for history articles" ON bv_history_articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access for history timeline" ON bv_history_timeline FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access for knowledge base" ON bv_knowledge_base FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access for auto imports" ON bv_auto_imports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access for cocktail recipes" ON bv_cocktail_recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access for distilleries" ON bv_distilleries FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_history_articles_category ON bv_history_articles(category);
CREATE INDEX IF NOT EXISTS idx_history_articles_slug ON bv_history_articles(slug);
CREATE INDEX IF NOT EXISTS idx_history_timeline_year ON bv_history_timeline(year);
CREATE INDEX IF NOT EXISTS idx_history_timeline_category ON bv_history_timeline(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON bv_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_cocktail_recipes_base_spirit ON bv_cocktail_recipes(base_spirit);
CREATE INDEX IF NOT EXISTS idx_distilleries_country ON bv_distilleries(country);

-- ============================================
-- SEED DATA - Sample History Articles
-- ============================================

INSERT INTO bv_history_articles (title, slug, category, content, excerpt, reading_time_minutes, is_featured)
VALUES 
('The Birth of Bourbon: A Kentucky Legend', 'birth-of-bourbon', 'bourbon', 
'Bourbon whiskey, Americas native spirit, has a rich and storied history dating back to the late 18th century. The story begins in the rolling hills of Kentucky, where settlers from Scotland, Ireland, and Germany brought their distilling traditions to the New World...

The limestone-filtered water of Kentucky proved ideal for whiskey production. The porous limestone naturally filters out iron and other minerals while adding calcium and magnesium, which are essential for the fermentation process...

By the 1820s, Kentucky had become the epicenter of American whiskey production. The term "bourbon" itself likely derives from Bourbon County, Kentucky, though the exact origin remains debated by historians...', 
'Discover how bourbon whiskey became Americas native spirit in the hills of Kentucky.',
8, true),

('Scotch Whisky: A Journey Through the Highlands', 'scotch-whisky-history', 'scotch',
'The history of Scotch whisky stretches back over 500 years, with the earliest recorded mention appearing in the Exchequer Rolls of Scotland in 1494. Friar John Cor was granted eight bolls of malt to make aqua vitae (water of life)...

The distinct character of Scotch whisky comes from its unique terroir. The peaty soil, clean water sources, and maritime climate of Scotland create flavor profiles impossible to replicate elsewhere...

Today, there are five officially recognized Scotch whisky regions: Speyside, Highland, Lowland, Islay, and Campbeltown. Each region imparts distinctive characteristics to its whiskies...',
'Explore the 500-year heritage of Scotch whisky from the Scottish Highlands.',
10, true),

('The Prohibition Era: Americas Noble Experiment', 'prohibition-era', 'general',
'On January 17, 1920, the 18th Amendment to the United States Constitution went into effect, ushering in one of the most transformative periods in American drinking history. The Prohibition era, lasting until 1933, would forever change the American spirits industry...

While legal alcohol production ceased, bootlegging operations flourished. Speakeasies became cultural institutions, and organized crime grew wealthy from illicit alcohol sales...

The repeal of Prohibition in 1933 led to a complete restructuring of the American spirits industry. Many pre-Prohibition distilleries never reopened, while new operations emerged to meet the pent-up demand...',
'How the 18th Amendment transformed American drinking culture and the spirits industry.',
7, false);

-- Seed History Timeline Events
INSERT INTO bv_history_timeline (year, title, description, category, significance, era)
VALUES
(1494, 'First Written Record of Scotch Whisky', 'Friar John Cor receives eight bolls of malt to make aqua vitae, the earliest documented reference to Scotch whisky production.', 'scotch', 'critical', 'medieval'),
(1783, 'Evan Williams Opens Kentucky Distillery', 'Evan Williams establishes what becomes one of the first commercial distilleries in Kentucky, helping establish the bourbon tradition.', 'bourbon', 'major', 'colonial'),
(1823, 'Excise Act Transforms Scotch Industry', 'The Excise Act makes legal distillation more accessible, leading to the closure of illicit operations and the rise of commercial Scotch production.', 'scotch', 'critical', 'industrial'),
(1920, 'Prohibition Begins in United States', 'The 18th Amendment takes effect, banning the manufacture, sale, and transportation of alcoholic beverages across America.', 'general', 'critical', 'prohibition'),
(1933, 'Prohibition Repealed', 'The 21st Amendment ends Prohibition, allowing legal alcohol production to resume in the United States.', 'general', 'critical', 'prohibition'),
(1964, 'Bourbon Declared Americas Native Spirit', 'Congress declares bourbon whiskey to be a "distinctive product of the United States," giving it protected status.', 'bourbon', 'major', 'modern');

