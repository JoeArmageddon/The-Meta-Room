// Entity Types
export type EntityType = 'skill' | 'agent' | 'prompt' | 'workflow' | 'documentation';

export interface Source {
  id: string;
  name: string;
  type: 'github' | 'upload' | 'manual';
  repo_url?: string;
  import_date: string;
  entry_count?: number;
}

export interface Entry {
  id: string;
  type: EntityType;
  title: string;
  slug: string;
  original_content: string;
  source_id: string;
  file_path?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  // Joined fields
  source?: Source;
  ai_explanation?: AIExplanation;
  user_notes?: UserNote[];
  relationships?: Relationship[];
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
