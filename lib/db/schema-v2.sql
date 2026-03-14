-- THE META ROOM v2 - ULTIMATE AI AGENT HUB SCHEMA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CORE TABLES

-- Sources (repos, uploads, manual)
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('github', 'upload', 'manual', 'community')),
    repo_url TEXT,
    author_name TEXT,
    author_avatar TEXT,
    stars INTEGER DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hierarchical Collections
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES collections(id) ON DELETE SET NULL,
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

-- MAIN ENTRIES TABLE (skills, agents, prompts, workflows)
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('skill', 'agent', 'prompt', 'workflow', 'pattern', 'tool', 'resource')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    original_content TEXT NOT NULL,
    rendered_content TEXT, -- Pre-rendered HTML
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    file_path TEXT,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    
    -- Taxonomy
    tags TEXT[] DEFAULT '{}',
    ai_tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    
    -- Quality & Metadata
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_time TEXT, -- "5 min", "30 min", "1 hour"
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    copy_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(2,1) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Media
    screenshot_url TEXT,
    demo_url TEXT,
    video_url TEXT,
    
    -- Status
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI EXPLANATIONS
CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE UNIQUE,
    summary TEXT NOT NULL,
    detailed_explanation TEXT NOT NULL,
    key_takeaways TEXT[] DEFAULT '{}',
    use_cases TEXT[] DEFAULT '{}',
    examples TEXT[] DEFAULT '{}',
    code_examples JSONB DEFAULT '[]',
    related_tools TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    model_used TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELATIONSHIPS (connections between entries)
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    target_entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('depends_on', 'uses', 'related_to', 'part_of', 'extends', 'alternative_to', 'prerequisite_for')),
    strength DECIMAL(3,2) DEFAULT 1.0,
    evidence TEXT,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    detected_by TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_entry_id, target_entry_id, relationship_type)
);

-- USER INTERACTIONS
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    folder_name TEXT DEFAULT 'Default',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, user_id)
);

CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, user_id)
);

CREATE TABLE user_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    note TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEARNING PATHS
CREATE TABLE learning_paths (
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

-- PROMPT TESTING HISTORY
CREATE TABLE prompt_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous',
    test_input TEXT,
    test_output TEXT,
    model_used TEXT,
    latency_ms INTEGER,
    token_count INTEGER,
    was_successful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMBEDDINGS FOR SEARCH
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE UNIQUE,
    embedding VECTOR(1536),
    content_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_complexity ON entries(complexity);
CREATE INDEX idx_entries_featured ON entries(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_entries_tags ON entries USING GIN(tags);
CREATE INDEX idx_entries_ai_tags ON entries USING GIN(ai_tags);
CREATE INDEX idx_entries_categories ON entries USING GIN(categories);
CREATE INDEX idx_entries_source ON entries(source_id);
CREATE INDEX idx_entries_collection ON entries(collection_id);
CREATE INDEX idx_entries_rating ON entries(rating_avg DESC);
CREATE INDEX idx_entries_views ON entries(view_count DESC);
CREATE INDEX idx_entries_slug ON entries(slug);
CREATE INDEX idx_entries_fts ON entries USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(original_content, '')));
CREATE INDEX idx_entries_title_trgm ON entries USING GIN(title gin_trgm_ops);

CREATE INDEX idx_collections_featured ON collections(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_collections_parent ON collections(parent_id);
CREATE INDEX idx_collections_source ON collections(source_id);

CREATE INDEX idx_relationships_source ON relationships(source_entry_id);
CREATE INDEX idx_relationships_target ON relationships(target_entry_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);

CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_entry ON user_bookmarks(entry_id);
CREATE INDEX idx_ratings_entry ON user_ratings(entry_id);
CREATE INDEX idx_views_entry ON user_views(entry_id);
CREATE INDEX idx_views_recent ON user_views(viewed_at DESC);

CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- FUNCTIONS

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update collection entry count
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

CREATE TRIGGER update_collection_count 
    AFTER INSERT OR DELETE OR UPDATE OF collection_id ON entries
    FOR EACH ROW EXECUTE FUNCTION update_collection_entry_count();

-- Update entry rating average
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

CREATE TRIGGER update_entry_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_entry_rating();

-- SEMANTIC SEARCH
CREATE OR REPLACE FUNCTION search_entries_semantic(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE(
    id UUID,
    type TEXT,
    title TEXT,
    slug TEXT,
    description TEXT,
    tags TEXT[],
    complexity TEXT,
    rating_avg DECIMAL,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.type,
        e.title,
        e.slug,
        e.description,
        e.tags,
        e.complexity,
        e.rating_avg,
        1 - (emb.embedding <=> query_embedding) AS similarity
    FROM entries e
    JOIN embeddings emb ON e.id = emb.entry_id
    WHERE 1 - (emb.embedding <=> query_embedding) > match_threshold
    AND e.is_published = TRUE
    ORDER BY emb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- FIND SIMILAR ENTRIES
CREATE OR REPLACE FUNCTION find_similar_entries(
    entry_id UUID,
    match_count INT DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    slug TEXT,
    type TEXT,
    similarity FLOAT
) AS $$
DECLARE
    entry_embedding VECTOR(1536);
BEGIN
    SELECT embedding INTO entry_embedding
    FROM embeddings WHERE embeddings.entry_id = find_similar_entries.entry_id;
    
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.slug,
        e.type,
        1 - (emb.embedding <=> entry_embedding) AS similarity
    FROM entries e
    JOIN embeddings emb ON e.id = emb.entry_id
    WHERE e.id != entry_id
    AND e.is_published = TRUE
    ORDER BY emb.embedding <=> entry_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- GET TRENDING ENTRIES
CREATE OR REPLACE FUNCTION get_trending_entries(
    days_back INT DEFAULT 7,
    match_count INT DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    slug TEXT,
    type TEXT,
    view_count BIGINT,
    trend_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.slug,
        e.type,
        COUNT(v.id) as view_count,
        (COUNT(v.id) * 1.0 / GREATEST(EXTRACT(EPOCH FROM (NOW() - e.created_at)) / 86400, 1))::FLOAT as trend_score
    FROM entries e
    LEFT JOIN user_views v ON e.id = v.entry_id AND v.viewed_at > NOW() - (days_back || ' days')::INTERVAL
    WHERE e.is_published = TRUE
    GROUP BY e.id
    HAVING COUNT(v.id) > 0
    ORDER BY trend_score DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- RLS POLICIES
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" ON entries FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON sources FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON ai_explanations FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON relationships FOR SELECT USING (true);
CREATE POLICY "Allow all read" ON learning_paths FOR SELECT USING (true);

CREATE POLICY "Allow all write" ON entries FOR ALL USING (true);
CREATE POLICY "Allow all write" ON collections FOR ALL USING (true);
CREATE POLICY "Allow all write" ON sources FOR ALL USING (true);
CREATE POLICY "Allow all write" ON ai_explanations FOR ALL USING (true);
CREATE POLICY "Allow all write" ON relationships FOR ALL USING (true);
CREATE POLICY "Allow all write" ON user_bookmarks FOR ALL USING (true);
CREATE POLICY "Allow all write" ON user_ratings FOR ALL USING (true);
CREATE POLICY "Allow all write" ON user_notes FOR ALL USING (true);
CREATE POLICY "Allow all write" ON learning_paths FOR ALL USING (true);

-- SEED DATA
INSERT INTO collections (name, slug, description, icon, color, is_featured, display_order) VALUES
('Agent Patterns', 'agent-patterns', 'Core patterns for building AI agents', 'Bot', '#8B5CF6', TRUE, 1),
('Prompt Engineering', 'prompt-engineering', 'Techniques for effective prompting', 'MessageSquare', '#10B981', TRUE, 2),
('Skills Library', 'skills-library', 'Reusable agent capabilities', 'Wrench', '#3B82F6', TRUE, 3),
('Workflows', 'workflows', 'Multi-step agent workflows', 'GitBranch', '#F59E0B', TRUE, 4),
('Tools & Integrations', 'tools', 'External tools and APIs', 'Plug', '#EC4899', TRUE, 5),
('Best Practices', 'best-practices', 'Guidelines and recommendations', 'BookOpen', '#14B8A6', FALSE, 6);

INSERT INTO learning_paths (title, slug, description, difficulty, estimated_hours, outcomes, is_featured) VALUES
('Agent Building Fundamentals', 'agent-fundamentals', 'Learn the basics of building AI agents from scratch', 'beginner', 10, ARRAY['Understand agent architecture', 'Build your first agent', 'Master basic prompting'], TRUE),
('Advanced Prompt Engineering', 'advanced-prompts', 'Master complex prompting techniques for better results', 'advanced', 15, ARRAY['Chain-of-thought prompting', 'Few-shot learning', 'Prompt optimization'], TRUE),
('Production-Ready Agents', 'production-agents', 'Take your agents from prototype to production', 'intermediate', 20, ARRAY['Error handling', 'Monitoring and logging', 'Scaling strategies'], TRUE);
