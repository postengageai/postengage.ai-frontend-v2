'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditBalanceCard } from '@/components/credits/credit-balance-card';
import { UsageSummaryCards } from '@/components/credits/usage-summary-cards';
import { UsageChart } from '@/components/credits/usage-chart';
import { TransactionHistory } from '@/components/credits/transaction-history';
import { CreditsInfoCard } from '@/components/credits/credits-info-card';
import { Coins, Activity, Receipt } from 'lucide-react';
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

export default function CreditsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Use the credits store
  const balance = useCreditsBalance();
  const transactions = useCreditsTransactions();
  const transactionsTotal = useCreditsTransactionsTotal();
  const isTransactionsLoading = useCreditsTransactionsLoading();
  const isUsageLoading = useCreditsUsageLoading();
  const usage = useCreditsUsage();
  const isLoading = useCreditsLoading();
  const { fetchBalance, fetchTransactions, fetchUsage, fetchInvoices } =
    useCreditsActions();

  // Fetch data on component mount
  useEffect(() => {
    fetchBalance();
    fetchUsage();
    fetchInvoices();
  }, [fetchBalance, fetchUsage, fetchInvoices]);

  // Fetch transactions when page changes
  useEffect(() => {
    fetchTransactions(pageSize, (currentPage - 1) * pageSize);
  }, [fetchTransactions, currentPage]);

  const handleDateRangeChange = (range: DateRange) => {
    const days = range === '7d' ? 7 : 30;
    fetchUsage(days);
  };

  // Handle loading and null states
  const displayBalance = balance?.available_credits ?? 0;
  const displayUsage = usage ?? {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
    totals: { purchases: 0, consumption: 0, adjustments: 0 },
    daily: [],
    total_transactions: 0,
  };

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
            Credits & Usage
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Track your credit balance, usage history, and activity in real time.
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/dashboard/credits/buy'>
            <Button size='sm' className='gap-2'>
              <Coins className='h-4 w-4' />
              Buy Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit Balance Card */}
      <CreditBalanceCard balance={displayBalance} isLoading={isLoading} />

      {/* Usage Summary Cards */}
      <UsageSummaryCards
        consumed={displayUsage.totals.consumption}
        purchased={displayUsage.totals.purchases}
        totalTransactions={displayUsage.total_transactions}
        isLoading={isLoading}
      />

      {/* Usage Chart */}
      <UsageChart
        data={displayUsage.daily.map(d => ({
          date: d.date,
          consumption: d.consumption,
          purchases: d.purchases,
        }))}
        isLoading={isUsageLoading}
        onDateRangeChange={handleDateRangeChange}
      />

      <Tabs defaultValue='activity' className='w-full'>
        <TabsList className='grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='activity' className='gap-2'>
            <Activity className='h-4 w-4' />
            Usage Activity
          </TabsTrigger>
          <TabsTrigger value='billing' className='gap-2'>
            <Receipt className='h-4 w-4' />
            Billing & Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value='activity' className='mt-6'>
          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            total={transactionsTotal}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            isLoading={isTransactionsLoading}
          />
        </TabsContent>

        {/* <TabsContent value='billing' className='mt-6'>
          <InvoicesTable
            invoices={paginatedInvoices}
            total={invoices.length}
            currentPage={invoicePage}
            pageSize={pageSize}
            onPageChange={setInvoicePage}
            isLoading={isLoading}
          />
        </TabsContent> */}
      </Tabs>

      {/* Info Card */}
      <CreditsInfoCard />
    </div>
  );
}
