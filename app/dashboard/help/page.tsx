'use client';

import React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Mail,
  CreditCard,
  Instagram,
  Settings,
  Send,
  Clock,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { SupportApi } from '@/lib/api/support';

const faqItems = [
  {
    question: 'How do credits work?',
    answer:
      'Credits are consumed only when AI generates a reply. Manual actions (simple replies, DMs) are free (0 credits). AI-generated replies cost between 6-13 credits depending on complexity. If you use your own API key (BYOM), AI actions cost only 1 credit for infrastructure.',
  },
  {
    question: "Why isn't my automation triggering?",
    answer:
      "There are a few common reasons: 1) Make sure your automation is set to 'Active' status. 2) Check that your Instagram account is still connected. 3) Verify your trigger conditions - the keywords might not match the incoming comments/DMs. 4) Ensure you have sufficient credits in your account.",
  },
  {
    question: 'How do I connect my Instagram account?',
    answer:
      "Go to Settings > Social Accounts and click 'Connect Instagram'. You'll need a Business or Creator account (not a personal account). Follow the Instagram authorization flow to grant PostEngageAI the necessary permissions.",
  },
  {
    question: 'What happens when I run out of credits?',
    answer:
      "When your credits reach zero, your automations will be paused automatically. You'll receive an email notification before this happens. Simply purchase more credits to resume your automations - they'll pick up right where they left off.",
  },
  {
    question: 'Can I use AI for my automated replies?',
    answer:
      "Yes! When creating an automation, you can toggle on 'AI-Generated Reply'. The AI will generate contextual responses based on the incoming message. You can also set the tone (professional, friendly, casual) to match your brand voice.",
  },
  {
    question: 'Is my Instagram account data secure?',
    answer:
      'Absolutely. We use OAuth 2.0 for Instagram authentication, meaning we never store your Instagram password. All data is encrypted in transit and at rest. We only request the minimum permissions needed to run your automations.',
  },
];

export default function HelpSupportPage() {
  const { toast } = useToast();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await SupportApi.createTicket({
        category: ticketCategory,
        subject: ticketSubject,
        message: ticketMessage,
      });

      setTicketSubmitted(true);
      setTicketSubject('');
      setTicketMessage('');
      setTicketCategory('');

      toast({
        title: 'Success',
        description: 'Support ticket submitted successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit support ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen pb-20 md:pb-0'>
      <div className='px-4 py-8 md:py-12'>
        <div className='mx-auto max-w-6xl space-y-12'>
          {/* FAQ Section */}
          <section id='faq'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10'>
                <Lightbulb className='h-5 w-5 text-amber-500' />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold'>
                Frequently Asked Questions
              </h2>
            </div>

            <Card>
              <CardContent className='p-4 md:p-6'>
                <Accordion type='single' collapsible className='w-full'>
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className='text-left hover:no-underline hover:text-primary'>
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className='text-muted-foreground'>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Contact Support */}
          <section id='contact'>
            <div className='grid lg:grid-cols-5 gap-8'>
              {/* Contact Form */}
              <div className='lg:col-span-3'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <MessageCircle className='h-5 w-5 text-primary' />
                      Submit a Support Ticket
                    </CardTitle>
                    <CardDescription>
                      Can{"'"}t find what you{"'"}re looking for? Our support
                      team typically responds within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ticketSubmitted ? (
                      <div className='text-center py-8'>
                        <div className='mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4'>
                          <CheckCircle2 className='h-8 w-8 text-emerald-500' />
                        </div>
                        <h3 className='text-xl font-semibold mb-2'>
                          Ticket Submitted!
                        </h3>
                        <p className='text-muted-foreground mb-6'>
                          We{"'"}ve received your request and will get back to
                          you within 24 hours.
                        </p>
                        <Button
                          onClick={() => setTicketSubmitted(false)}
                          variant='outline'
                        >
                          Submit Another Ticket
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitTicket} className='space-y-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='category'>Category</Label>
                          <Select
                            value={ticketCategory}
                            onValueChange={setTicketCategory}
                          >
                            <SelectTrigger id='category'>
                              <SelectValue placeholder='Select a category' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='technical'>
                                Technical Issue
                              </SelectItem>
                              <SelectItem value='billing'>
                                Billing & Credits
                              </SelectItem>
                              <SelectItem value='account'>
                                Account & Login
                              </SelectItem>
                              <SelectItem value='instagram'>
                                Instagram Integration
                              </SelectItem>
                              <SelectItem value='feature'>
                                Feature Request
                              </SelectItem>
                              <SelectItem value='other'>Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='subject'>Subject</Label>
                          <Input
                            id='subject'
                            placeholder='Brief description of your issue'
                            value={ticketSubject}
                            onChange={e => setTicketSubject(e.target.value)}
                            required
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='message'>Message</Label>
                          <Textarea
                            id='message'
                            placeholder='Please describe your issue in detail. Include any error messages or steps to reproduce the problem.'
                            value={ticketMessage}
                            onChange={e => setTicketMessage(e.target.value)}
                            rows={5}
                            required
                          />
                        </div>

                        <Button
                          type='submit'
                          className='w-full'
                          disabled={
                            isSubmitting ||
                            !ticketCategory ||
                            !ticketSubject ||
                            !ticketMessage
                          }
                        >
                          {isSubmitting ? (
                            <>
                              <div className='h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className='mr-2 h-4 w-4' />
                              Submit Ticket
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className='lg:col-span-2 space-y-4'>
                <Card>
                  <CardContent className='p-5'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                        <Mail className='h-6 w-6 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Email Support</p>
                        <a
                          href='mailto:postengage.ai@gmail.com'
                          className='text-sm text-primary hover:underline'
                        >
                          postengage.ai@gmail.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-5'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10'>
                        <Clock className='h-6 w-6 text-emerald-500' />
                      </div>
                      <div>
                        <p className='font-medium'>Response Time</p>
                        <p className='text-sm text-muted-foreground'>
                          Within 24 hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className='bg-primary/5 border-primary/20'>
                  <CardContent className='p-5'>
                    <div className='flex items-start gap-4'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                        <AlertCircle className='h-6 w-6 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Urgent Issues?</p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          For account security or billing emergencies, mention
                          "URGENT" in your ticket subject.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-5'>
                    <p className='font-medium mb-3'>Quick Links</p>
                    <div className='space-y-2'>
                      <Link
                        href='/dashboard/settings'
                        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
                      >
                        <Settings className='h-4 w-4' />
                        Account Settings
                      </Link>
                      <Link
                        href='/dashboard/credits'
                        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
                      >
                        <CreditCard className='h-4 w-4' />
                        Manage Credits
                      </Link>
                      <Link
                        href='/dashboard/settings/social-accounts'
                        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
                      >
                        <Instagram className='h-4 w-4' />
                        Social Accounts
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
