'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  MoreHorizontal,
  Trash,
  Pencil,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { BrandVoice } from '@/lib/types/intelligence';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrandVoicesPage() {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await IntelligenceApi.getBrandVoices();
      if (response && response.data) {
        setVoices(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load brand voices',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand voice?')) return;

    try {
      await IntelligenceApi.deleteBrandVoice(id);
      setVoices(voices.filter(v => v._id !== id));
      toast({
        title: 'Success',
        description: 'Brand voice deleted successfully',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete brand voice',
      });
    }
  };

  const filteredVoices = voices.filter(voice =>
    voice.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='h-full flex flex-col'>
      {/* Header Section */}
      <div className='flex items-center justify-between p-6 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Brand Voices</h2>
          <p className='text-muted-foreground'>
            Manage the personalities and tones your AI bots will use.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search voices...'
              className='pl-9 bg-background'
            />
          </div>
          <Link href='/dashboard/intelligence/brand-voices/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Create Voice
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className='flex-1 p-6'>
        {isLoading ? (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-10 w-64' />
              <Skeleton className='h-10 w-32' />
            </div>
            <div className='border rounded-md'>
              <div className='p-4 border-b bg-muted/40'>
                <div className='grid grid-cols-5 gap-4'>
                  <Skeleton className='h-6 w-full col-span-1' />
                  <Skeleton className='h-6 w-full col-span-1' />
                  <Skeleton className='h-6 w-full col-span-1' />
                  <Skeleton className='h-6 w-full col-span-1' />
                  <Skeleton className='h-6 w-full col-span-1' />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='p-4 border-b last:border-0'>
                  <div className='grid grid-cols-5 gap-4'>
                    <Skeleton className='h-6 w-full col-span-1' />
                    <Skeleton className='h-6 w-full col-span-1' />
                    <Skeleton className='h-6 w-full col-span-1' />
                    <Skeleton className='h-6 w-full col-span-1' />
                    <Skeleton className='h-6 w-full col-span-1' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : voices.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed rounded-lg bg-muted/10'>
            <div className='mb-4 rounded-full bg-primary/10 p-6'>
              <MessageSquare className='h-10 w-10 text-primary' />
            </div>
            <h3 className='mb-2 text-xl font-bold'>No Brand Voices Yet</h3>
            <p className='mb-6 max-w-sm text-muted-foreground'>
              Create your first brand voice to give your AI bots a unique
              personality.
            </p>
            <Link href='/dashboard/intelligence/brand-voices/new'>
              <Button size='lg'>
                <Plus className='mr-2 h-5 w-5' />
                Create Brand Voice
              </Button>
            </Link>
          </div>
        ) : (
          <div className='border rounded-lg bg-card shadow-sm'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/40 hover:bg-muted/40'>
                  <TableHead className='w-[250px]'>Name</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Formality</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoices.map(voice => (
                  <TableRow key={voice._id} className='group'>
                    <TableCell className='font-medium'>
                      <div className='flex flex-col'>
                        <span className='text-base'>{voice.name}</span>
                        {voice.description && (
                          <span className='text-xs text-muted-foreground line-clamp-1'>
                            {voice.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='capitalize'>
                        {voice.tone_primary}
                        {voice.tone_intensity > 7 && '+'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='capitalize'>
                        {voice.formality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {voice.keywords_to_include?.slice(0, 3).map(k => (
                          <span
                            key={k}
                            className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary'
                          >
                            {k}
                          </span>
                        ))}
                        {(voice.keywords_to_include?.length || 0) > 3 && (
                          <span className='text-xs text-muted-foreground self-center ml-1'>
                            +{voice.keywords_to_include!.length - 3} more
                          </span>
                        )}
                        {(!voice.keywords_to_include ||
                          voice.keywords_to_include.length === 0) && (
                          <span className='text-xs text-muted-foreground italic'>
                            None
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <Link
                            href={`/dashboard/intelligence/brand-voices/${voice._id}`}
                          >
                            <DropdownMenuItem>
                              <Pencil className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive'
                            onClick={() => deleteVoice(voice._id)}
                          >
                            <Trash className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
