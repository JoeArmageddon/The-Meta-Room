export type EntityType = 'skill' | 'agent' | 'prompt' | 'workflow' | 'pattern' | 'tool' | 'resource' | 'documentation';
export type Complexity = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Source {
  id: string;
  name: string;
  type: 'github' | 'upload' | 'manual' | 'community';
  repo_url?: string;
  author_name?: string;
  author_avatar?: string;
  stars: number;
  last_sync_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  source_id?: string;
  path?: string;
  icon: string;
  color: string;
  cover_image?: string;
  entry_count: number;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  children?: Collection[];
}

export interface Entry {
  id: string;
  type: EntityType;
  title: string;
  slug: string;
  description?: string;
  original_content: string;
  rendered_content?: string;
  source_id: string;
  file_path?: string;
  collection_id?: string;
  
  tags: string[];
  ai_tags: string[];
  categories: string[];
  
  quality_score?: number;
  complexity?: Complexity;
  estimated_time?: string;
  
  view_count: number;
  copy_count: number;
  bookmark_count: number;
  rating_avg: number;
  rating_count: number;
  
  screenshot_url?: string;
  demo_url?: string;
  video_url?: string;
  
  is_featured: boolean;
  is_published: boolean;
  
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  source?: Source;
  collection?: Collection;
  ai_explanation?: AIExplanation;
  relationships?: Relationship[];
  user_bookmark?: UserBookmark;
  user_rating?: UserRating;
}

export interface AIExplanation {
  id: string;
  entry_id: string;
  summary: string;
  detailed_explanation: string;
  key_takeaways: string[];
  use_cases: string[];
  examples: string[];
  code_examples: { language: string; code: string; description?: string }[];
  related_tools: string[];
  prerequisites: string[];
  model_used?: string;
  generated_at: string;
}

export interface Relationship {
  id: string;
  source_entry_id: string;
  target_entry_id: string;
  relationship_type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends' | 'alternative_to' | 'prerequisite_for';
  strength: number;
  evidence?: string;
  confidence: number;
  detected_by: 'ai' | 'manual' | 'content_analysis';
  created_at: string;
  target_entry?: Entry;
  source_entry?: Entry;
}

export interface UserBookmark {
  id: string;
  entry_id: string;
  user_id: string;
  folder_name: string;
  notes?: string;
  created_at: string;
}

export interface UserRating {
  id: string;
  entry_id: string;
  user_id: string;
  rating: number;
  review?: string;
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

export interface AITaggingResult {
  tags: string[];
  categories: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  keywords: string[];
}

export interface UserNote {
  id: string;
  entry_id: string;
  user_id: string;
  note: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description?: string;
  difficulty?: Complexity;
  estimated_hours?: number;
  entry_ids: string[];
  prerequisites: string[];
  outcomes: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
  entries?: Entry[];
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
  suggested_collection?: string;
  detected_relationships?: DetectedRelationship[];
  quality_score?: QualityScore;
}

export interface DetectedRelationship {
  target_name: string;
  type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends';
  evidence: string;
  confidence: number;
}

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

export type SkillCategory = 
  | 'writing' | 'coding' | 'designing' | 'analysis' | 'research'
  | 'communication' | 'productivity' | 'learning' | 'creative'
  | 'business' | 'data' | 'marketing' | 'development' | 'testing'
  | 'debugging' | 'documentation' | 'planning' | 'automation'
  | 'integration' | 'security' | 'ai' | 'machine-learning'
  | 'devops' | 'frontend' | 'backend' | 'database' | 'api'
  | 'mobile' | 'web' | 'cloud' | 'infrastructure';

export interface ParsedEntity {
  type: EntityType;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  tags?: string[];
  suggested_collection?: string;
  detected_relationships?: DetectedRelationship[];
  quality_score?: QualityScore;
}

export interface DetectedRelationship {
  target_name: string;
  type: 'depends_on' | 'uses' | 'related_to' | 'part_of' | 'extends';
  evidence: string;
  confidence: number;
}

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
