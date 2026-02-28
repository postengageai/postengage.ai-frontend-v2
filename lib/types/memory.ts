// === Entity Types ===
export type EntityType =
  | 'user_name'
  | 'preference'
  | 'commitment'
  | 'question_asked'
  | 'product_interest'
  | 'objection'
  | 'timeline'
  | 'budget'
  | 'custom';

export interface MemoryEntity {
  type: EntityType;
  key: string;
  value: string;
  confidence: number;
  source: 'deterministic' | 'llm' | 'manual';
  first_seen_at: string;
  last_updated_at: string;
  expires_at?: string;
}

// === Relationship Memory ===
export type RelationshipStage =
  | 'new'
  | 'engaged'
  | 'loyal'
  | 'at_risk'
  | 'churned';

export interface ConversationSummary {
  conversation_id: string;
  summary: string;
  topics: string[];
  mood: string;
  message_count: number;
  created_at: string;
}

export interface UserRelationshipMemory {
  _id: string;
  social_account_id: string;
  platform_user_id: string;
  platform_username?: string;
  entities: MemoryEntity[];
  conversation_summaries: ConversationSummary[];
  communication_preference: 'formal' | 'casual' | 'mixed';
  primary_language: string;
  relationship_stage: RelationshipStage;
  one_line_profile: string;
  total_interactions: number;
  first_interaction_at: string;
  last_interaction_at: string;
  created_at: string;
  updated_at: string;
}

// === Memory Stats ===
export interface MemoryStats {
  total_users_tracked: number;
  total_entities_stored: number;
  entities_by_type: Record<EntityType, number>;
  relationship_stage_breakdown: Record<RelationshipStage, number>;
  avg_entities_per_user: number;
  memory_tier_usage: {
    working_memory_keys: number;
    conversation_summaries: number;
    relationship_memories: number;
  };
}

// === Query Params ===
export interface MemoryUsersParams {
  page?: number;
  limit?: number;
  stage?: RelationshipStage;
  search?: string;
  sort_by?: 'last_interaction' | 'total_interactions' | 'entity_count';
  sort_order?: 'asc' | 'desc';
}
