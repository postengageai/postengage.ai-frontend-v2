'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useUser, useUserActions } from '@/lib/user/store';
import { AuthApi } from '@/lib/api/auth';
import { toast } from '@/components/ui/use-toast';

const MfaCodeSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

type MfaCodeFormValues = z.infer<typeof MfaCodeSchema>;

export function SecurityForm() {
  const user = useUser();
  const { updateUser } = useUserActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMfa, setIsGeneratingMfa] = useState(false);
  const [mfaData, setMfaData] = useState<{
    secret: string;
    qrCode: string;
  } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const form = useForm<MfaCodeFormValues>({
    resolver: zodResolver(MfaCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const handleGenerateMfa = async () => {
    try {
      setIsGeneratingMfa(true);
      const response = await AuthApi.generateMfaSecret();
      setMfaData(response.data!);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate MFA secret. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingMfa(false);
    }
  };

  const onEnableMfa = async (values: MfaCodeFormValues) => {
    try {
      setIsLoading(true);
      const response = await AuthApi.enableMfa({ token: values.code });

      setBackupCodes(response.data!.backupCodes);
      updateUser({ is_mfa_enabled: true });
      setMfaData(null);
      form.reset();

      toast({
        title: 'MFA Enabled',
        description: 'Two-factor authentication has been successfully enabled.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to verify MFA code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    try {
      setIsLoading(true);
      await AuthApi.disableMfa();
      updateUser({ is_mfa_enabled: false });
      setBackupCodes(null);

      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to disable MFA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    });
  };

  if (!user) return null;

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a code
            from your authenticator app when logging in.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-0.5'>
              <div className='font-medium'>Authenticator App</div>
              <div className='text-sm text-muted-foreground'>
                Use an app like Google Authenticator or Authy.
              </div>
            </div>
            {user.is_mfa_enabled ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='destructive' disabled={isLoading}>
                    Disable MFA
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Disable Two-Factor Authentication?
                    </DialogTitle>
                    <DialogDescription>
                      This will remove the extra layer of security from your
                      account. Are you sure you want to continue?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant='outline' onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={handleDisableMfa}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      Disable MFA
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                onClick={handleGenerateMfa}
                disabled={isGeneratingMfa || !!mfaData}
              >
                {isGeneratingMfa && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Setup MFA
              </Button>
            )}
          </div>

          {/* MFA Setup Step 1: QR Code */}
          {mfaData && !user.is_mfa_enabled && (
            <div className='mt-4 rounded-lg border p-4 bg-muted/50'>
              <h3 className='font-medium mb-4'>Scan QR Code</h3>
              <div className='flex flex-col md:flex-row gap-6'>
                <div className='bg-white p-4 rounded-lg w-fit flex flex-col items-center justify-center'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mfaData.qrCode}
                    alt='Scan QR Code'
                    width={200}
                    height={200}
                  />
                </div>
                <div className='space-y-4 flex-1'>
                  <p className='text-sm text-muted-foreground'>
                    Scan this QR code with your authenticator app. If you
                    can&apos;t scan it, enter the text code below manually.
                  </p>
                  <div className='flex items-center gap-2'>
                    <Input
                      readOnly
                      value={mfaData.secret}
                      className='font-mono bg-background'
                    />
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => copyToClipboard(mfaData.secret)}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onEnableMfa)}
                      className='space-y-4 mt-4'
                    >
                      <FormField
                        control={form.control}
                        name='code'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authentication Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='123456'
                                maxLength={6}
                                className='font-mono tracking-widest'
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the 6-digit code from your app to verify
                              setup.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='flex gap-2'>
                        <Button type='submit' disabled={isLoading}>
                          {isLoading && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          )}
                          Verify & Enable
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          onClick={() => {
                            setMfaData(null);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes Display (only after enabling) */}
          {backupCodes && (
            <Alert className='border-green-500/50 bg-green-500/10'>
              <Check className='h-4 w-4 text-green-500' />
              <AlertTitle className='text-green-500'>
                MFA Successfully Enabled
              </AlertTitle>
              <AlertDescription className='mt-2'>
                <p className='mb-2'>
                  Please save these backup codes in a secure place. You can use
                  them to access your account if you lose your device.
                </p>
                <div className='grid grid-cols-2 gap-2 mt-4'>
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className='bg-background/80 p-2 rounded font-mono text-center text-sm border'
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-4 w-full'
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                >
                  <Copy className='mr-2 h-3 w-3' />
                  Copy All Codes
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
