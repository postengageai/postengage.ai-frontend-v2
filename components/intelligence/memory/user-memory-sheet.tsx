'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserMemoryDetail } from './user-memory-detail';
import type { UserRelationshipMemory } from '@/lib/types/memory';

interface UserMemorySheetProps {
  user: UserRelationshipMemory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserMemorySheet({
  user,
  open,
  onOpenChange,
}: UserMemorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg w-full p-0'>
        <SheetHeader className='px-6 pt-6 pb-4 border-b'>
          <SheetTitle>User Memory</SheetTitle>
        </SheetHeader>
        <ScrollArea className='h-[calc(100vh-5rem)]'>
          <div className='px-6 py-4'>
            {user ? (
              <UserMemoryDetail user={user} />
            ) : (
              <p className='text-sm text-muted-foreground text-center py-8'>
                Select a user to view their memory.
              </p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
