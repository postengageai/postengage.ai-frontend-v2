'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useUserActions } from '@/lib/user/store';
import { UserApi } from '@/lib/api/user';
import { PreferencesFormSkeleton } from './preferences-form-skeleton';

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

export function PreferencesForm() {
  const user = useUser();
  const userActions = useUserActions();
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        setIsLoadingData(true);
        setError(null);

        if (user) {
          if (user.language) {
            setLanguage(user.language);
          }
          if (user.timezone) {
            setTimezone(user.timezone);
          }
        }
      } catch (_err) {
        setError(
          'Failed to load user preferences. Please try refreshing the page.'
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserPreferences();
  }, [user]);

  const handleChange = () => {
    setHasChanges(true);
    setIsSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Update user preferences via API
      await UserApi.updateProfile({
        language,
        timezone,
      });

      // Update local user state
      userActions.updateUser({
        language,
        timezone,
      });

      setIsSaved(true);
      setHasChanges(false);
    } catch (_err) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading skeleton while data is being fetched
  if (isLoadingData) {
    return <PreferencesFormSkeleton />;
  }

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

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>
            Set your preferred language and timezone for the app
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='language'>Language</Label>
              <Select
                value={language}
                onValueChange={value => {
                  setLanguage(value);
                  handleChange();
                }}
              >
                <SelectTrigger id='language'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='timezone'>Timezone</Label>
              <Select
                value={timezone}
                onValueChange={value => {
                  setTimezone(value);
                  handleChange();
                }}
              >
                <SelectTrigger id='timezone'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-xs text-muted-foreground'>
                Used for timestamps and scheduled reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className='flex items-center justify-end gap-3'>
        {isSaved && (
          <span className='flex items-center gap-1.5 text-sm text-green-500'>
            <Check className='h-4 w-4' />
            Preferences saved
          </span>
        )}
        <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save preferences
        </Button>
      </div>
    </div>
  );
}
