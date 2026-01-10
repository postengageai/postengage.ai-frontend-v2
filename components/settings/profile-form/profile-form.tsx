'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Check, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { User } from '@/lib/types/settings';
import { useUserActions, useUserStore } from '@/lib/user/store';
import { UserApi } from '@/lib/api/user';
import { ProfileFormSkeleton } from './profile-form-skeleton';

export function ProfileForm() {
  const { user, isLoading: isUserLoading } = useUserStore();
  const userActions = useUserActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show skeleton while user data is loading
  if (isUserLoading || !user) {
    return <ProfileFormSkeleton />;
  }

  const handleInputChange = (field: keyof User, value: string) => {
    userActions.updateUser({ [field]: value });
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);

      try {
        // Upload avatar to server
        const response = await UserApi.uploadAvatar(file);

        // Update local state with the uploaded media object
        userActions.updateUser({
          avatar: response.media,
        });

        setHasChanges(true);
        setIsSaved(false);
      } catch (_error) {
        setError('Failed to upload avatar. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        // ...(user.avatar ? { avatar_id: user.avatar.id } : {}),
      };

      // Call API to update profile
      const updatedUser = await UserApi.updateProfile(updateData);

      // Update local store with the response
      userActions.setUser(updatedUser);

      setIsSaved(true);
      setHasChanges(false);
    } catch (_error) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

          <Separator />

          {/* Read-only Fields */}
          <div className='grid'>
            <div className='space-y-2'>
              <Label className='text-muted-foreground'>Email</Label>
              <Input value={user.email} disabled className='bg-muted' />
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
