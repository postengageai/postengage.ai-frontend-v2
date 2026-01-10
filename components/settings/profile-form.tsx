'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Check, Loader2 } from 'lucide-react';
import { mockUser } from '@/lib/mock/settings-data';
import type { User } from '@/lib/types/settings';

export function ProfileForm() {
  const [user, setUser] = useState<User>(mockUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof User, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to server and get URL
      const url = URL.createObjectURL(file);
      setUser(prev => ({
        ...prev,
        avatar: { id: 'new', url },
      }));
      setHasChanges(true);
      setIsSaved(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSaved(true);
    setHasChanges(false);
  };

  const getInitials = () => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and how others see you
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Avatar Section */}
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <button
                type='button'
                onClick={handleAvatarClick}
                className='group relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-2 ring-border transition-all hover:ring-primary'
              >
                {user.avatar?.url ? (
                  <Image
                    src={user.avatar.url || '/placeholder.svg'}
                    alt='Profile'
                    fill
                    className='object-cover'
                  />
                ) : (
                  <span className='flex h-full w-full items-center justify-center text-xl font-medium text-muted-foreground'>
                    {getInitials()}
                  </span>
                )}
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Camera className='h-5 w-5 text-white' />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
                className='hidden'
              />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>
                Profile photo
              </p>
              <p className='text-xs text-muted-foreground'>
                Click to upload. Max 5MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='first_name'>First name</Label>
              <Input
                id='first_name'
                value={user.first_name}
                onChange={e => handleInputChange('first_name', e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='last_name'>Last name</Label>
              <Input
                id='last_name'
                value={user.last_name}
                onChange={e => handleInputChange('last_name', e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone number</Label>
            <Input
              id='phone'
              type='tel'
              value={user.phone || ''}
              onChange={e => handleInputChange('phone', e.target.value)}
              placeholder='Optional'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={user.status}
              onValueChange={value => handleInputChange('status', value)}
            >
              <SelectTrigger id='status'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Read-only Fields */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label className='text-muted-foreground'>Email</Label>
              <Input value={user.email} disabled className='bg-muted' />
            </div>
            <div className='space-y-2'>
              <Label className='text-muted-foreground'>Role</Label>
              <Input
                value={user.role}
                disabled
                className='bg-muted capitalize'
              />
            </div>
          </div>

          {/* Save Button */}
          <div className='flex items-center justify-end gap-3 pt-2'>
            {isSaved && (
              <span className='flex items-center gap-1.5 text-sm text-green-500'>
                <Check className='h-4 w-4' />
                Changes saved
              </span>
            )}
            <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-4 text-sm sm:grid-cols-3'>
            <div>
              <dt className='text-muted-foreground'>Created</dt>
              <dd className='font-medium text-foreground'>
                {formatDate(user.created_at)}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Last updated</dt>
              <dd className='font-medium text-foreground'>
                {formatDate(user.updated_at)}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Email status</dt>
              <dd>
                <Badge
                  variant={user.is_verified ? 'default' : 'secondary'}
                  className={
                    user.is_verified
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      : ''
                  }
                >
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
