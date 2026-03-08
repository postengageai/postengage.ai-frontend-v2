'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditBalanceCard } from '@/components/credits/credit-balance-card';
import { UsageSummaryCards } from '@/components/credits/usage-summary-cards';
import { UsageChart } from '@/components/credits/usage-chart';
import { TransactionHistory } from '@/components/credits/transaction-history';
import { CreditsInfoCard } from '@/components/credits/credits-info-card';
import {
  Coins,
  Activity,
  Receipt,
  Download,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  useCreditsBalance,
  useCreditsTransactions,
  useCreditsTransactionsTotal,
  useCreditsTransactionsLoading,
  useCreditsUsageLoading,
  useCreditsUsage,
  useCreditsLoading,
  useCreditsActions,
} from '@/lib/credits/store';
import { DateRange } from '@/lib/types/credits';
import { CreditsApi, Invoice, InvoicesResponse } from '@/lib/api/credits';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';

// ─── Invoices tab component ───────────────────────────────────────────────────

function InvoicesTab() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [emailingId, setEmailingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const res = (await CreditsApi.getInvoices({
          page,
          limit: 10,
        })) as unknown as InvoicesResponse;
        setInvoices(res.data ?? []);
        setMeta(res.meta ?? { total: 0, page: 1, limit: 10, total_pages: 1 });
      } catch (_err) {
        const err = parseApiError(_err);
        toast({
          variant: 'destructive',
          title: err.title,
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const handleEmail = async (invoiceId: string) => {
    setEmailingId(invoiceId);
    try {
      await CreditsApi.emailInvoice(invoiceId);
      toast({
        title: 'Email sent',
        description: 'Invoice has been sent to your email.',
      });
    } catch (_err) {
      const err = parseApiError(_err);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setEmailingId(null);
    }
  };

  const statusColor: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className='h-16 w-full rounded-lg' />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/5'>
        <FileText className='h-10 w-10 text-muted-foreground mb-3' />
        <h3 className='font-semibold'>No invoices yet</h3>
        <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
          Invoices are automatically generated when you purchase credits.
        </p>
        <Link href='/dashboard/credits/buy' className='mt-4'>
          <Button size='sm'>
            <Coins className='mr-2 h-4 w-4' />
            Buy Credits
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Table */}
      <div className='rounded-xl border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-muted/40 border-b'>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                Invoice
              </th>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell'>
                Package
              </th>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell'>
                Date
              </th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground'>
                Amount
              </th>
              <th className='text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell'>
                Status
              </th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {invoices.map(inv => (
              <tr key={inv._id} className='hover:bg-muted/20 transition-colors'>
                <td className='px-4 py-3'>
                  <div className='font-medium'>{inv.invoice_number}</div>
                  <div className='text-xs text-muted-foreground sm:hidden'>
                    {inv.package_name}
                  </div>
                </td>
                <td className='px-4 py-3 hidden sm:table-cell text-muted-foreground'>
                  {inv.package_name}
                  <div className='text-xs'>
                    {inv.credits_purchased.toLocaleString()} credits
                  </div>
                </td>
                <td className='px-4 py-3 hidden md:table-cell text-muted-foreground'>
                  {new Date(inv.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className='px-4 py-3 text-right font-semibold'>
                  {inv.currency_symbol}
                  {inv.total_amount.toFixed(2)}
                  <div className='text-xs font-normal text-muted-foreground'>
                    {inv.currency_code}
                  </div>
                </td>
                <td className='px-4 py-3 text-center hidden sm:table-cell'>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[inv.status] ?? statusColor.paid}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      title='Download PDF'
                      onClick={() => CreditsApi.downloadInvoice(inv._id)}
                    >
                      <Download className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      title='Email invoice'
                      disabled={emailingId === inv._id}
                      onClick={() => handleEmail(inv._id)}
                    >
                      <Mail className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{meta.total} invoices total</span>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              disabled={meta.page <= 1}
              onClick={() => fetchInvoices(meta.page - 1)}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span>
              Page {meta.page} of {meta.total_pages}
            </span>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              disabled={meta.page >= meta.total_pages}
              onClick={() => fetchInvoices(meta.page + 1)}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page content (uses useSearchParams — must be inside Suspense) ─────────────

function CreditsPageContent() {
  const searchParams = useSearchParams();
  const defaultTab =
    searchParams.get('tab') === 'invoices' ? 'billing' : 'activity';

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const balance = useCreditsBalance();
  const transactions = useCreditsTransactions();
  const transactionsTotal = useCreditsTransactionsTotal();
  const isTransactionsLoading = useCreditsTransactionsLoading();
  const isUsageLoading = useCreditsUsageLoading();
  const usage = useCreditsUsage();
  const isLoading = useCreditsLoading();
  const { fetchBalance, fetchTransactions, fetchUsage } = useCreditsActions();

  useEffect(() => {
    fetchBalance();
    fetchUsage();
  }, [fetchBalance, fetchUsage]);

  useEffect(() => {
    fetchTransactions(pageSize, (currentPage - 1) * pageSize);
  }, [fetchTransactions, currentPage]);

  const handleDateRangeChange = (range: DateRange) => {
    fetchUsage(range === '7d' ? 7 : 30);
  };

  const displayBalance = balance?.available_credits ?? 0;
  const displayUsage = usage ?? {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
    totals: { purchases: 0, consumption: 0, adjustments: 0 },
    daily: [],
    total_transactions: 0,
  };

  // Low balance warning
  const isLowBalance = displayBalance > 0 && displayBalance < 100;
  const isOutOfCredits = displayBalance === 0;

  return (
    <div className='mx-auto max-w-5xl space-y-6 p-4 sm:p-6'>
      {/* Low balance banner */}
      {(isLowBalance || isOutOfCredits) && (
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            isOutOfCredits
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          <div className='flex items-center gap-2'>
            <Coins className='h-4 w-4 shrink-0' />
            <span>
              {isOutOfCredits
                ? 'You have no credits left. Automations are paused.'
                : `Low balance — only ${displayBalance} credits remaining. Top up to keep automations running.`}
            </span>
          </div>
          <Link href='/dashboard/credits/buy' className='shrink-0'>
            <Button
              size='sm'
              variant={isOutOfCredits ? 'destructive' : 'default'}
              className='h-7 text-xs px-3'
            >
              Buy Credits
            </Button>
          </Link>
        </div>
      )}

      {/* Page Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
            Credits & Billing
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Track your credit balance, usage history, and invoices.
          </p>
        </div>
        <Link href='/dashboard/credits/buy'>
          <Button size='sm' className='gap-2'>
            <Coins className='h-4 w-4' />
            Buy Credits
          </Button>
        </Link>
      </div>

      <CreditBalanceCard balance={displayBalance} isLoading={isLoading} />

      <UsageSummaryCards
        consumed={Math.abs(displayUsage.totals.consumption)}
        purchased={displayUsage.totals.purchases}
        totalTransactions={displayUsage.total_transactions}
        isLoading={isLoading}
      />

      <UsageChart
        data={displayUsage.daily.map(d => ({
          date: d.date,
          consumption: Math.abs(d.consumption),
          purchases: d.purchases,
        }))}
        isLoading={isUsageLoading}
        onDateRangeChange={handleDateRangeChange}
      />

      <Tabs defaultValue={defaultTab} className='w-full'>
        <TabsList className='grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='activity' className='gap-2'>
            <Activity className='h-4 w-4' />
            Usage Activity
          </TabsTrigger>
          <TabsTrigger value='billing' className='gap-2'>
            <Receipt className='h-4 w-4' />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value='activity' className='mt-6'>
          <TransactionHistory
            transactions={transactions}
            total={transactionsTotal}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            isLoading={isTransactionsLoading}
          />
        </TabsContent>

        <TabsContent value='billing' className='mt-6'>
          <InvoicesTab />
        </TabsContent>
      </Tabs>

      <CreditsInfoCard />
    </div>
  );
}

// ─── Default export — wraps content in Suspense for useSearchParams ────────────

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <div className='mx-auto max-w-5xl space-y-6 p-4 sm:p-6'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-32 w-full' />
        </div>
      }
    >
      <CreditsPageContent />
    </Suspense>
  );
}
