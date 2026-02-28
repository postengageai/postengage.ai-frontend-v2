'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceDnaApi } from '@/lib/api/voice-dna';

interface SampleReplyGeneratorProps {
  voiceDnaId: string;
}

interface GeneratedSample {
  userMessage: string;
  reply: string;
  confidence: number;
}

export function SampleReplyGenerator({
  voiceDnaId,
}: SampleReplyGeneratorProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [samples, setSamples] = useState<GeneratedSample[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputMessage.trim()) return;
    setIsGenerating(true);
    try {
      const response = await VoiceDnaApi.generateSampleReply({
        voice_dna_id: voiceDnaId,
        user_message: inputMessage,
      });
      if (response?.data) {
        setSamples(prev => [
          {
            userMessage: inputMessage,
            reply: response.data.generated_reply,
            confidence: response.data.confidence,
          },
          ...prev,
        ]);
        setInputMessage('');
      }
    } catch {
      // Silent
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-50 text-green-700 border-green-300';
    if (score >= 0.5) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    return 'bg-red-50 text-red-700 border-red-300';
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Sparkles className='h-4 w-4' />
          Test Your Voice
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Input
            placeholder='Type a message to see how your bot would reply...'
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className='text-sm'
          />
          <Button
            size='sm'
            onClick={handleGenerate}
            disabled={isGenerating || !inputMessage.trim()}
          >
            {isGenerating ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <Send className='h-3.5 w-3.5' />
            )}
          </Button>
        </div>

        {samples.length === 0 ? (
          <p className='text-xs text-center text-muted-foreground py-4'>
            Send a test message to preview how your bot would reply
          </p>
        ) : (
          <div className='space-y-4 max-h-96 overflow-y-auto'>
            {samples.map((sample, i) => (
              <div key={i} className='space-y-2'>
                {/* User message */}
                <div className='flex justify-end'>
                  <div className='rounded-xl rounded-tr-sm bg-muted px-3 py-2 max-w-[80%]'>
                    <p className='text-sm'>{sample.userMessage}</p>
                  </div>
                </div>
                {/* Bot reply */}
                <div className='flex justify-start'>
                  <div className='rounded-xl rounded-tl-sm bg-primary/10 px-3 py-2 max-w-[80%]'>
                    <p className='text-sm'>{sample.reply}</p>
                    <div className='flex justify-end mt-1'>
                      <Badge
                        variant='outline'
                        className={`text-[9px] ${getConfidenceColor(sample.confidence)}`}
                      >
                        {(sample.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
