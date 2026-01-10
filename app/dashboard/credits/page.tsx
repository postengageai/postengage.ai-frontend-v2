'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditBalanceCard } from '@/components/credits/credit-balance-card';
import { UsageSummaryCards } from '@/components/credits/usage-summary-cards';
import { UsageChart } from '@/components/credits/usage-chart';
import { TransactionHistory } from '@/components/credits/transaction-history';
import { InvoicesTable } from '@/components/credits/invoices-table';
import { CreditsInfoCard } from '@/components/credits/credits-info-card';
import {
  mockCreditBalance,
  mockTransactions,
  mockUsage,
  mockInvoices,
} from '@/lib/mock/credits-data';
import { Coins, Activity, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function CreditsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);
  const pageSize = 10;

  // In production, these would be fetched from API
  const balance = mockCreditBalance.available_credits;
  const usage = mockUsage;
  const transactions = mockTransactions;
  const invoices = mockInvoices;
  const isLoading = false;

  // Paginate transactions
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedInvoices = invoices.slice(
    (invoicePage - 1) * pageSize,
    invoicePage * pageSize
  );

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
          <Link href='/pricing'>
            <Button variant='outline' size='sm'>
              View Pricing
            </Button>
          </Link>
          <Button size='sm' className='gap-2'>
            <Coins className='h-4 w-4' />
            Buy Credits
          </Button>
        </div>
      </div>

      {/* Credit Balance Card */}
      <CreditBalanceCard balance={balance} isLoading={isLoading} />

      {/* Usage Summary Cards */}
      <UsageSummaryCards
        consumed={usage.totals.consumption}
        purchased={usage.totals.purchases}
        totalTransactions={usage.total_transactions}
        isLoading={isLoading}
      />

      {/* Usage Chart */}
      <UsageChart
        data={usage.daily.map(d => ({
          date: d.date,
          consumption: d.consumption,
          purchases: d.purchases,
        }))}
        isLoading={isLoading}
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
            transactions={paginatedTransactions}
            total={transactions.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value='billing' className='mt-6'>
          {/* Invoices Table */}
          <InvoicesTable
            invoices={paginatedInvoices}
            total={invoices.length}
            currentPage={invoicePage}
            pageSize={pageSize}
            onPageChange={setInvoicePage}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <CreditsInfoCard />
    </div>
  );
}
