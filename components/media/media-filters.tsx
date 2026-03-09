'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface MediaFiltersProps {
  onSearchChange: (value: string) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onDateRangeChange: (start?: Date, end?: Date) => void;
}

export function MediaFilters({
  onSearchChange,
  onSortChange,
  onDateRangeChange,
}: MediaFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    onDateRangeChange(range?.from, range?.to);
  };

  const clearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
    onDateRangeChange(undefined, undefined);
  };

  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
      <div className='relative flex-1'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search media...'
          className='pl-9'
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className='flex gap-2'>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !date?.from && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} -{' '}
                    {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
              {(date?.from || date?.to) && (
                <div
                  role='button'
                  tabIndex={0}
                  className='ml-auto hover:bg-muted rounded-full p-1'
                  onClick={clearDateFilter}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      clearDateFilter(e as unknown as React.MouseEvent);
                    }
                  }}
                >
                  <X className='h-3 w-3' />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='end'>
            <Calendar
              initialFocus
              mode='range'
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select
          onValueChange={val => {
            const [by, order] = val.split('-');
            onSortChange(by, order as 'asc' | 'desc');
          }}
          defaultValue='created_at-desc'
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='created_at-desc'>Newest First</SelectItem>
            <SelectItem value='created_at-asc'>Oldest First</SelectItem>
            <SelectItem value='name-asc'>Name (A-Z)</SelectItem>
            <SelectItem value='name-desc'>Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
