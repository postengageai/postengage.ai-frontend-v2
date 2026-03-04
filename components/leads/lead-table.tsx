'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown, Instagram, Facebook, AtSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Lead } from '@/lib/types/leads';
import { LeadTagManager } from './lead-tag-manager';

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onTagsChange?: (leadId: string, tags: string[]) => void;
}

export function LeadTable({
  leads,
  isLoading = false,
  onTagsChange,
}: LeadTableProps) {
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedLeads = [...leads].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    if (sortBy === 'date') {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    } else {
      aVal = a.username.toLowerCase();
      bVal = b.username.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const toggleSort = (column: 'date' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform.toLowerCase() === 'instagram') {
      return <Instagram className='h-4 w-4' />;
    }
    if (platform.toLowerCase() === 'facebook') {
      return <Facebook className='h-4 w-4' />;
    }
    return <AtSign className='h-4 w-4' />;
  };

  if (isLoading) {
    return (
      <div className='border rounded-lg overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Captured From</TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleSort('date')}
                  className='h-6 px-0 hover:bg-transparent'
                >
                  Date
                  <ArrowUpDown className='h-3 w-3 ml-1' />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <div className='h-10 bg-muted/50 rounded animate-pulse' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/50'>
            <TableHead>Lead</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Captured From</TableHead>
            <TableHead>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => toggleSort('date')}
                className='h-6 px-0 hover:bg-transparent'
              >
                Date
                {sortBy === 'date' && <ArrowUpDown className='h-3 w-3 ml-1' />}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map(lead => (
            <TableRow key={lead.id} className='hover:bg-muted/50'>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={lead.profile_picture || undefined}
                      alt={lead.username}
                    />
                    <AvatarFallback>
                      {lead.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                      {lead.full_name || lead.username}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <span className='text-sm'>@{lead.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {getPlatformIcon(lead.platform)}
                  <span className='text-sm capitalize'>{lead.platform}</span>
                </div>
              </TableCell>
              <TableCell>
                <LeadTagManager
                  leadId={lead.id}
                  tags={lead.tags}
                  onTagsChange={onTagsChange}
                />
              </TableCell>
              <TableCell>
                <span className='text-sm text-muted-foreground'>
                  {lead.captured_from || '-'}
                </span>
              </TableCell>
              <TableCell>
                <span className='text-sm text-muted-foreground'>
                  {format(new Date(lead.created_at), 'MMM d, yyyy')}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
