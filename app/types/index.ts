// Entity Types
export type EntityType = 'skill' | 'agent' | 'prompt' | 'workflow' | 'documentation';

// Skill categories for classification
export type SkillCategory = 
  | 'writing'
  | 'coding'
  | 'designing'
  | 'analysis'
  | 'research'
  | 'communication'
  | 'productivity'
  | 'learning'
  | 'creative'
  | 'business'
  | 'data'
  | 'marketing'
  | 'development'
  | 'testing'
  | 'debugging'
  | 'documentation'
  | 'planning'
  | 'automation'
  | 'integration'
  | 'security'
  | 'ai'
  | 'machine-learning'
  | 'devops'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'api'
  | 'mobile'
  | 'web'
  | 'cloud'
  | 'infrastructure';

export interface Source {
  id: string;
  name: string;
  type: 'github' | 'upload' | 'manual';
  repo_url?: string;
  import_date: string;
  entry_count?: number;
  // New: Track last sync for incremental updates
  last_sync_at?: string;
  last_commit?: string;
}

// New: Collection/Folder structure
export interface Collection {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  source_id?: string;
  path?: string;  // For auto-created from folder structure
  color?: string;
  icon?: string;
  entry_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  type: EntityType;
  title: string;
  slug: string;
  original_content: string;
  source_id: string;
  file_path?: string;
  // New: Collection assignment
  collection_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  // New: Quality and analysis fields
  quality_score?: QualityScore;
  ai_tags?: string[];  // AI-generated tags
  // Joined fields
  source?: Source;
  ai_explanation?: AIExplanation;
  user_notes?: UserNote[];
  relationships?: Relationship[];
  collection?: Collection;
}

// New: Quality scoring
export interface QualityScore {
  overall: number;
  factors: {
    completeness: number;
    clarity: number;
    uniqueness: number;
    testability: number;
    documentation: number;
  };
  suggestions: string[];
}

export interface AIExplanation {
  id: string;
  entry_id: string;
  summary: string;
  detailed_explanation: string;
  use_cases: string[];
  examples: string[];
  related_tools?: string[];
  generated_at: string;
  model_used?: string;
}

export interface Relationship {
  id: string;
  source_entry_id: string;
  target_entry_id: string;
  relationship_type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends';
  strength?: number;
  // New: Evidence from content
  evidence?: string;
  confidence?: number;
  detected_by: 'ai' | 'manual' | 'content_analysis';
  created_at: string;
  // Joined fields
  target_entry?: Entry;
  source_entry?: Entry;
}

export interface UserNote {
  id: string;
  entry_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  entry: Entry;
  score: number;
  match_type: 'semantic' | 'fulltext' | 'hybrid';
}

export interface ParsedEntity {
  type: EntityType;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  tags?: string[];
  // New: Enrichment fields
  suggested_collection?: string;
  detected_relationships?: DetectedRelationship[];
  quality_score?: QualityScore;
}

// New: For relationship detection
export interface DetectedRelationship {
  target_name: string;  // Name of related skill/agent to find
  type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends';
  evidence: string;
  confidence: number;
}

export interface CLIOption {
  id: string;
  name: string;
  format: string;
  description: string;
}

export interface PromptSelection {
  skills: Entry[];
  agents: Entry[];
  cliFormat: string;
}

// Graph types for React Flow
export interface GraphNode {
  id: string;
  type: 'skill' | 'agent' | 'prompt' | 'workflow' | 'documentation';
  position: { x: number; y: number };
  data: {
    label: string;
    entry: Entry;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
}

export interface AgentTeam {
  id: string;
  name: string;
  description: string;
  agents: {
    role: string;
    agent_id: string;
    agent?: Entry;
  }[];
}

export interface ImportJob {
  id: string;
  source_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_files: number;
  processed_files: number;
  entries_found: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// New: Import Preview types
export interface ImportPreviewFile {
  path: string;
  entities: ParsedEntity[];
  willImport: boolean;
  suggestedCollection: string;
  duplicates?: DuplicateMatch[];
  warnings?: string[];
}

export interface DuplicateMatch {
  entry: Entry;
  similarity: number;
  matchReason: string;
}

export interface ImportPreview {
  files: ImportPreviewFile[];
  stats: {
    totalFiles: number;
    totalEntities: number;
    newEntities: number;
    potentialDuplicates: number;
    suggestedCollections: string[];
  };
}

// New: AI Tagging result
export interface AITaggingResult {
  tags: string[];
  categories: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  keywords: string[];
}
