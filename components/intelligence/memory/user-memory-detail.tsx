'use client';

import { Globe, MessageCircle, Clock, Calendar, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { RelationshipStageBadge } from './relationship-stage';
import { EntityCard } from './entity-card';
import { MemoryTimeline } from './memory-timeline';
import type {
  UserRelationshipMemory,
  MemoryEntity,
  EntityType,
} from '@/lib/types/memory';

interface UserMemoryDetailProps {
  user: UserRelationshipMemory;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function groupEntitiesByType(
  entities: MemoryEntity[]
): Record<string, MemoryEntity[]> {
  const groups: Record<string, MemoryEntity[]> = {};
  for (const entity of entities) {
    const key = entity.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entity);
  }
  return groups;
}

const entityGroupLabels: Record<EntityType, string> = {
  user_name: 'Personal Info',
  preference: 'Preferences',
  commitment: 'Commitments',
  question_asked: 'Questions Asked',
  product_interest: 'Product Interests',
  objection: 'Objections',
  timeline: 'Timelines',
  budget: 'Budget Info',
  custom: 'Other',
};

export function UserMemoryDetail({ user }: UserMemoryDetailProps) {
  const entityGroups = groupEntitiesByType(user.entities);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-4'>
        <div className='flex items-start gap-4'>
          <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
            <span className='text-lg font-semibold text-primary'>
              {(user.platform_username || user.platform_user_id)
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='text-lg font-semibold truncate'>
              {user.platform_username || user.platform_user_id}
            </h3>
            {user.one_line_profile && (
              <p className='text-sm text-muted-foreground'>
                {user.one_line_profile}
              </p>
            )}
            <div className='flex flex-wrap gap-2 mt-2'>
              <RelationshipStageBadge stage={user.relationship_stage} />
              <Badge variant='outline' className='text-xs gap-1'>
                <MessageCircle className='h-3 w-3' />
                {user.communication_preference}
              </Badge>
              <Badge variant='outline' className='text-xs gap-1'>
                <Globe className='h-3 w-3' />
                {user.primary_language}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-3 gap-3'>
          <div className='text-center p-3 rounded-lg bg-muted/50'>
            <Activity className='h-4 w-4 mx-auto text-muted-foreground mb-1' />
            <p className='text-lg font-bold'>{user.total_interactions}</p>
            <p className='text-[10px] text-muted-foreground'>Interactions</p>
          </div>
          <div className='text-center p-3 rounded-lg bg-muted/50'>
            <Calendar className='h-4 w-4 mx-auto text-muted-foreground mb-1' />
            <p className='text-sm font-medium'>
              {formatDate(user.first_interaction_at)}
            </p>
            <p className='text-[10px] text-muted-foreground'>First Seen</p>
          </div>
          <div className='text-center p-3 rounded-lg bg-muted/50'>
            <Clock className='h-4 w-4 mx-auto text-muted-foreground mb-1' />
            <p className='text-sm font-medium'>
              {formatDate(user.last_interaction_at)}
            </p>
            <p className='text-[10px] text-muted-foreground'>Last Active</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Entities Section */}
      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>
          Remembered Information ({user.entities.length})
        </h4>

        {user.entities.length === 0 ? (
          <p className='text-sm text-muted-foreground py-4 text-center'>
            No specific information extracted yet. Entities are automatically
            extracted from conversations.
          </p>
        ) : (
          Object.entries(entityGroups).map(([type, entities]) => (
            <Collapsible key={type} defaultOpen>
              <CollapsibleTrigger className='flex items-center justify-between w-full text-xs font-medium py-1.5 text-muted-foreground hover:text-foreground'>
                <span>
                  {entityGroupLabels[type as EntityType] || type} (
                  {entities.length})
                </span>
                <ChevronDown className='h-3 w-3 transition-transform duration-200' />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1'>
                  {entities.map((entity, idx) => (
                    <EntityCard key={`${entity.key}-${idx}`} entity={entity} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>

      <Separator />

      {/* Conversation History */}
      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>
          Conversation History ({user.conversation_summaries.length})
        </h4>
        <MemoryTimeline conversations={user.conversation_summaries} />
      </div>
    </div>
  );
}
