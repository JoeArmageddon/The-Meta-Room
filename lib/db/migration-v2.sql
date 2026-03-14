-- MIGRATION: Upgrade existing database to v2 schema
-- Run this if you already have the old schema installed

-- STEP 1: Create new tables first (they don't reference existing tables)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID, -- Will add FK later after table exists
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    path TEXT,
    icon TEXT DEFAULT 'Folder',
    color TEXT DEFAULT '#3B82F6',
    cover_image TEXT,
    entry_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add self-reference FK for collections after table exists
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_parent_id_fkey;
ALTER TABLE collections ADD CONSTRAINT collections_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    folder_name TEXT DEFAULT 'Default',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours INTEGER,
    entry_ids UUID[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    outcomes TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Add new columns to existing tables (now that collections exists)
DO $$
BEGIN
    -- Add columns to sources table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'author_name') THEN
        ALTER TABLE sources ADD COLUMN author_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'author_avatar') THEN
        ALTER TABLE sources ADD COLUMN author_avatar TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'stars') THEN
        ALTER TABLE sources ADD COLUMN stars INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'last_sync_at') THEN
        ALTER TABLE sources ADD COLUMN last_sync_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'last_commit') THEN
        ALTER TABLE sources ADD COLUMN last_commit TEXT;
    END IF;
END $$;

-- Add new columns to entries table (collections now exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'description') THEN
        ALTER TABLE entries ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'rendered_content') THEN
        ALTER TABLE entries ADD COLUMN rendered_content TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'collection_id') THEN
        ALTER TABLE entries ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'ai_tags') THEN
        ALTER TABLE entries ADD COLUMN ai_tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'categories') THEN
        ALTER TABLE entries ADD COLUMN categories TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'quality_score') THEN
        ALTER TABLE entries ADD COLUMN quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'complexity') THEN
        ALTER TABLE entries ADD COLUMN complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'estimated_time') THEN
        ALTER TABLE entries ADD COLUMN estimated_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'view_count') THEN
        ALTER TABLE entries ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'copy_count') THEN
        ALTER TABLE entries ADD COLUMN copy_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'bookmark_count') THEN
        ALTER TABLE entries ADD COLUMN bookmark_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'rating_avg') THEN
        ALTER TABLE entries ADD COLUMN rating_avg DECIMAL(2,1) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'rating_count') THEN
        ALTER TABLE entries ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'screenshot_url') THEN
        ALTER TABLE entries ADD COLUMN screenshot_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'demo_url') THEN
        ALTER TABLE entries ADD COLUMN demo_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'video_url') THEN
        ALTER TABLE entries ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'is_published') THEN
        ALTER TABLE entries ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- STEP 3: Update entries type constraint to include new types
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_type_check;
ALTER TABLE entries ADD CONSTRAINT entries_type_check 
    CHECK (type IN ('skill', 'agent', 'prompt', 'workflow', 'pattern', 'tool', 'resource', 'documentation'));

-- STEP 4: Add new columns to ai_explanations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_explanations' AND column_name = 'key_takeaways') THEN
        ALTER TABLE ai_explanations ADD COLUMN key_takeaways TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_explanations' AND column_name = 'code_examples') THEN
        ALTER TABLE ai_explanations ADD COLUMN code_examples JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_explanations' AND column_name = 'prerequisites') THEN
        ALTER TABLE ai_explanations ADD COLUMN prerequisites TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- STEP 5: Add new columns to relationships
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relationships' AND column_name = 'evidence') THEN
        ALTER TABLE relationships ADD COLUMN evidence TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relationships' AND column_name = 'confidence') THEN
        ALTER TABLE relationships ADD COLUMN confidence DECIMAL(3,2) DEFAULT 1.0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relationships' AND column_name = 'detected_by') THEN
        ALTER TABLE relationships ADD COLUMN detected_by TEXT DEFAULT 'manual';
    END IF;
END $$;

-- STEP 6: Update relationship_type constraint
ALTER TABLE relationships DROP CONSTRAINT IF EXISTS relationships_relationship_type_check;
ALTER TABLE relationships ADD CONSTRAINT relationships_relationship_type_check 
    CHECK (relationship_type IN ('depends_on', 'uses', 'related_to', 'part_of', 'extends', 'alternative_to', 'prerequisite_for'));

-- STEP 7: Add RLS policies for new tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Read policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Allow all read" ON collections;
DROP POLICY IF EXISTS "Allow all read" ON user_bookmarks;
DROP POLICY IF EXISTS "Allow all read" ON user_ratings;
DROP POLICY IF EXISTS "Allow all read" ON learning_paths;

CREATE POLICY "Allow all read" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON user_bookmarks FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON learning_paths FOR SELECT USING (true);

-- Write policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Allow all write" ON collections;
DROP POLICY IF EXISTS "Allow all write" ON user_bookmarks;
DROP POLICY IF EXISTS "Allow all write" ON user_ratings;
DROP POLICY IF EXISTS "Allow all write" ON learning_paths;

CREATE POLICY "Allow all write" ON collections FOR ALL USING (true);
CREATE POLICY "Allow all write" ON user_bookmarks FOR ALL USING (true);
CREATE POLICY "Allow all write" ON user_ratings FOR ALL USING (true);
CREATE POLICY "Allow all write" ON learning_paths FOR ALL USING (true);

-- STEP 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_complexity ON entries(complexity);
CREATE INDEX IF NOT EXISTS idx_entries_featured ON entries(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_entries_ai_tags ON entries USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_entries_categories ON entries USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_entries_rating ON entries(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_entries_views ON entries(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_collections_parent ON collections(parent_id);

-- STEP 9: Create trigger for collection entry count
CREATE OR REPLACE FUNCTION update_collection_entry_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
        UPDATE collections SET entry_count = entry_count + 1 WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
        UPDATE collections SET entry_count = entry_count - 1 WHERE id = OLD.collection_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.collection_id IS DISTINCT FROM OLD.collection_id THEN
            IF OLD.collection_id IS NOT NULL THEN
                UPDATE collections SET entry_count = entry_count - 1 WHERE id = OLD.collection_id;
            END IF;
            IF NEW.collection_id IS NOT NULL THEN
                UPDATE collections SET entry_count = entry_count + 1 WHERE id = NEW.collection_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_collection_count ON entries;
CREATE TRIGGER update_collection_count 
    AFTER INSERT OR DELETE OR UPDATE OF collection_id ON entries
    FOR EACH ROW EXECUTE FUNCTION update_collection_entry_count();

-- STEP 10: Create trigger for entry rating average
CREATE OR REPLACE FUNCTION update_entry_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE entries 
    SET 
        rating_avg = (SELECT AVG(rating)::DECIMAL(2,1) FROM user_ratings WHERE entry_id = COALESCE(NEW.entry_id, OLD.entry_id)),
        rating_count = (SELECT COUNT(*) FROM user_ratings WHERE entry_id = COALESCE(NEW.entry_id, OLD.entry_id))
    WHERE id = COALESCE(NEW.entry_id, OLD.entry_id);
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_entry_rating_trigger ON user_ratings;
CREATE TRIGGER update_entry_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_entry_rating();

-- STEP 11: Insert seed data for collections (if empty)
INSERT INTO collections (name, slug, description, icon, color, is_featured, display_order)
SELECT * FROM (VALUES
    ('Agent Patterns', 'agent-patterns', 'Core patterns for building AI agents', 'Bot', '#8B5CF6', TRUE, 1),
    ('Prompt Engineering', 'prompt-engineering', 'Techniques for effective prompting', 'MessageSquare', '#10B981', TRUE, 2),
    ('Skills Library', 'skills-library', 'Reusable agent capabilities', 'Wrench', '#3B82F6', TRUE, 3),
    ('Workflows', 'workflows', 'Multi-step agent workflows', 'GitBranch', '#F59E0B', TRUE, 4),
    ('Tools & Integrations', 'tools', 'External tools and APIs', 'Plug', '#EC4899', TRUE, 5),
    ('Best Practices', 'best-practices', 'Guidelines and recommendations', 'BookOpen', '#14B8A6', FALSE, 6)
) AS v(name, slug, description, icon, color, is_featured, display_order)
WHERE NOT EXISTS (SELECT 1 FROM collections LIMIT 1);

-- STEP 12: Insert seed data for learning paths (if empty)
INSERT INTO learning_paths (title, slug, description, difficulty, estimated_hours, outcomes, is_featured)
SELECT * FROM (VALUES
    ('Agent Building Fundamentals', 'agent-fundamentals', 'Learn the basics of building AI agents from scratch', 'beginner', 10, ARRAY['Understand agent architecture', 'Build your first agent', 'Master basic prompting'], TRUE),
    ('Advanced Prompt Engineering', 'advanced-prompts', 'Master complex prompting techniques for better results', 'advanced', 15, ARRAY['Chain-of-thought prompting', 'Few-shot learning', 'Prompt optimization'], TRUE),
    ('Production-Ready Agents', 'production-agents', 'Take your agents from prototype to production', 'intermediate', 20, ARRAY['Error handling', 'Monitoring and logging', 'Scaling strategies'], TRUE)
) AS v(title, slug, description, difficulty, estimated_hours, outcomes, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM learning_paths LIMIT 1);
