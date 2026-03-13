-- The Meta Room Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Sources table: tracks imported repositories and files
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('github', 'upload', 'manual')),
    repo_url TEXT,
    import_date TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entries table: stores all skills, agents, prompts, workflows, documentation
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('skill', 'agent', 'prompt', 'workflow', 'documentation')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    original_content TEXT NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    file_path TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Explanations table: cached AI-generated explanations
CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE UNIQUE,
    summary TEXT NOT NULL,
    detailed_explanation TEXT NOT NULL,
    use_cases TEXT[] DEFAULT '{}',
    examples TEXT[] DEFAULT '{}',
    related_tools TEXT[] DEFAULT '{}',
    model_used TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships table: connections between entries
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    target_entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('depends_on', 'uses', 'related_to', 'part_of', 'extends')),
    strength DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_entry_id, target_entry_id, relationship_type)
);

-- User Notes table: user-generated notes on entries
CREATE TABLE user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'anonymous', -- For future auth
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Skills table: user-created skills (separate from imported)
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT DEFAULT 'anonymous',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector embeddings for semantic search
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE UNIQUE,
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
    content_hash TEXT, -- To detect changes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import jobs tracking
CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    entries_found INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_tags ON entries USING GIN(tags);
CREATE INDEX idx_entries_source ON entries(source_id);
CREATE INDEX idx_entries_slug ON entries(slug);
CREATE INDEX idx_relationships_source ON relationships(source_entry_id);
CREATE INDEX idx_relationships_target ON relationships(target_entry_id);
CREATE INDEX idx_user_notes_entry ON user_notes(entry_id);

-- Full-text search index
CREATE INDEX idx_entries_fts ON entries 
    USING GIN(to_tsvector('english', title || ' ' || COALESCE(original_content, '')));

-- Vector similarity search index
CREATE INDEX idx_embeddings_vector ON embeddings 
    USING ivfflat (embedding vector_cosine_ops);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Allow all read access (for public app)
CREATE POLICY "Allow all read access" ON entries FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON ai_explanations FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON relationships FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON user_notes FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON user_skills FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON sources FOR SELECT USING (true);

-- Allow all insert/update/delete (for development - restrict in production with auth)
CREATE POLICY "Allow all write access" ON entries FOR ALL USING (true);
CREATE POLICY "Allow all write access" ON ai_explanations FOR ALL USING (true);
CREATE POLICY "Allow all write access" ON relationships FOR ALL USING (true);
CREATE POLICY "Allow all write access" ON user_notes FOR ALL USING (true);
CREATE POLICY "Allow all write access" ON user_skills FOR ALL USING (true);
CREATE POLICY "Allow all write access" ON sources FOR ALL USING (true);

-- Function for semantic search
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
    original_content TEXT,
    tags TEXT[],
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.type,
        e.title,
        e.slug,
        e.original_content,
        e.tags,
        1 - (emb.embedding <=> query_embedding) AS similarity
    FROM entries e
    JOIN embeddings emb ON e.id = emb.entry_id
    WHERE 1 - (emb.embedding <=> query_embedding) > match_threshold
    ORDER BY emb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_entries_fulltext(
    search_query TEXT,
    match_count INT
)
RETURNS TABLE(
    id UUID,
    type TEXT,
    title TEXT,
    slug TEXT,
    original_content TEXT,
    tags TEXT[],
    rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.type,
        e.title,
        e.slug,
        e.original_content,
        e.tags,
        ts_rank(to_tsvector('english', e.title || ' ' || COALESCE(e.original_content, '')), 
                plainto_tsquery('english', search_query))::FLOAT AS rank
    FROM entries e
    WHERE to_tsvector('english', e.title || ' ' || COALESCE(e.original_content, '')) 
          @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
