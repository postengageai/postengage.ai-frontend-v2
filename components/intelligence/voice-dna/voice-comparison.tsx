'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceDnaApi } from '@/lib/api/voice-dna';

interface VoiceComparisonProps {
  voiceDnaId: string;
}

export function VoiceComparison({ voiceDnaId }: VoiceComparisonProps) {
  const [userMessage, setUserMessage] = useState(
    'Hey, I love your content! Can you help me with something?'
  );
  const [genericReply] = useState(
    "Thank you for your message! I'd be happy to help. What do you need assistance with?"
  );
  const [personalizedReply, setPersonalizedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!userMessage.trim()) return;
    setIsGenerating(true);
    try {
      const response = await VoiceDnaApi.generateSampleReply({
        voice_dna_id: voiceDnaId,
        user_message: userMessage,
      });
      if (response?.data) {
        setPersonalizedReply(response.data.generated_reply);
      }
    } catch {
      setPersonalizedReply('Could not generate sample. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Sparkles className='h-4 w-4' />
          Voice Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Input */}
        <div className='flex gap-2'>
          <Input
            placeholder='Type a sample user message...'
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            className='text-sm'
          />
          <Button
            size='sm'
            onClick={handleGenerate}
            disabled={isGenerating || !userMessage.trim()}
          >
            {isGenerating ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <RefreshCw className='h-3.5 w-3.5' />
            )}
          </Button>
        </div>

        {/* User message */}
        <div className='flex justify-center'>
          <div className='rounded-xl bg-muted px-4 py-2.5 max-w-[90%] text-center'>
            <p className='text-[10px] text-muted-foreground mb-1'>User says:</p>
            <p className='text-sm'>{userMessage}</p>
          </div>
        </div>

        {/* Side-by-side replies */}
        <div className='grid gap-3 sm:grid-cols-2'>
          {/* Without Voice DNA */}
          <div className='rounded-lg border p-4 space-y-2'>
            <p className='text-xs font-medium text-muted-foreground'>
              Without Voice DNA
            </p>
            <div className='rounded-md bg-muted/50 p-3'>
              <p className='text-sm text-muted-foreground'>{genericReply}</p>
            </div>
          </div>

          {/* With Voice DNA */}
          <div className='rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2'>
            <p className='text-xs font-medium text-primary'>With Voice DNA</p>
            <div className='rounded-md bg-primary/10 p-3'>
              {personalizedReply ? (
                <p className='text-sm'>{personalizedReply}</p>
              ) : (
                <p className='text-sm text-muted-foreground italic'>
                  Click the generate button to see the difference
                </p>
              )}
            </div>
          </div>
        </div>

        <p className='text-xs text-center text-muted-foreground'>
          The bot sounds more like you with Voice DNA
        </p>
      </CardContent>
    </Card>
  );
}
