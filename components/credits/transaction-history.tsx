'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import type { CreditTransaction } from '@/lib/types/credits';
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
  total: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  pageSize?: number;
}

export function TransactionHistory({
  transactions,
  total,
  isLoading,
  onPageChange,
  currentPage = 1,
  pageSize = 10,
}: TransactionHistoryProps) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<CreditTransaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getTypeIcon = (type: CreditTransaction['transaction_type']) => {
    switch (type) {
      case 'consumption':
        return <ArrowDownCircle className='h-4 w-4 text-chart-1' />;
      case 'purchase':
        return <ArrowUpCircle className='h-4 w-4 text-success' />;
      case 'adjustment':
        return <RefreshCw className='h-4 w-4 text-muted-foreground' />;
    }
  };

  const getStatusBadge = (status: CreditTransaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant='outline'
            className='border-success/30 bg-success/10 text-success'
          >
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            variant='outline'
            className='border-muted-foreground/30 bg-muted/50 text-muted-foreground'
          >
            Cancelled
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='border-warning/30 bg-warning/10 text-warning'
          >
            Pending
          </Badge>
        );
    }
  };

  const getCreditDisplay = (
    transaction: CreditTransaction,
    large?: boolean
  ) => {
    const sign = transaction.transaction_type === 'purchase' ? '+' : '-';
    const color =
      transaction.transaction_type === 'purchase'
        ? 'text-success'
        : 'text-foreground';
    const size = large ? 'text-2xl' : 'text-sm';

    if (transaction.status === 'cancelled') {
      return (
        <span className={`text-muted-foreground line-through ${size}`}>
          {sign}
          {transaction.credit_amount}
        </span>
      );
    }

    return (
      <span className={`font-mono font-semibold ${color} ${size}`}>
        {sign}
        {transaction.credit_amount}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card className='bg-card border-border'>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='text-base font-medium'>
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className='flex h-32 items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                No transactions yet.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-[180px]'>Date</TableHead>
                    <TableHead className='w-[100px]'>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right w-[100px]'>
                      Credits
                    </TableHead>
                    <TableHead className='text-right w-[120px]'>
                      Balance
                    </TableHead>
                    <TableHead className='w-[100px]'>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow
                      key={transaction._id}
                      className='cursor-pointer'
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <TableCell className='text-sm text-muted-foreground'>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getTypeIcon(transaction.transaction_type)}
                          <span className='text-sm capitalize'>
                            {transaction.transaction_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='max-w-[300px] truncate text-sm'>
                        {transaction.description}
                      </TableCell>
                      <TableCell className='text-right'>
                        {getCreditDisplay(transaction)}
                      </TableCell>
                      <TableCell className='text-right font-mono text-sm text-muted-foreground'>
                        {transaction.balance_after.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className='mt-4 flex items-center justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, total)} of {total}
                  </p>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange?.(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <span className='text-sm text-muted-foreground'>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPageChange?.(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <SheetContent className='w-full border-border bg-background sm:max-w-md'>
          <SheetHeader className='space-y-1 pb-4'>
            <SheetTitle className='text-lg font-semibold'>
              Transaction Details
            </SheetTitle>
          </SheetHeader>

          {selectedTransaction && (
            <div className='space-y-6 px-4'>
              {/* Hero Section - Amount & Status */}
              <div className='rounded-xl border border-border bg-card p-6'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      {selectedTransaction.transaction_type === 'purchase'
                        ? 'Credits Added'
                        : 'Credits Used'}
                    </p>
                    <div className='flex items-baseline gap-2'>
                      {getCreditDisplay(selectedTransaction, true)}
                      <span className='text-sm text-muted-foreground'>
                        credits
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>

                <Separator className='my-4' />

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs font-medium text-muted-foreground'>
                      Balance Before
                    </p>
                    <p className='mt-1 font-mono text-sm text-foreground'>
                      {selectedTransaction.balance_before.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-medium text-muted-foreground'>
                      Balance After
                    </p>
                    <p className='mt-1 font-mono text-sm text-foreground'>
                      {selectedTransaction.balance_after.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Description
                </p>
                <p className='text-sm leading-relaxed text-foreground'>
                  {selectedTransaction.description}
                </p>
              </div>

              {/* Timestamp */}
              <div className='space-y-2'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Timestamp
                </p>
                <p className='text-sm text-foreground'>
                  {formatFullDate(selectedTransaction.created_at)}
                </p>
              </div>

              {/* Technical Details - Collapsible Section */}
              {(selectedTransaction.automation_id ||
                selectedTransaction.reference_id ||
                selectedTransaction.credit_package_id) && (
                <div className='space-y-3'>
                  <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    Reference Information
                  </p>
                  <div className='space-y-2 rounded-lg border border-border bg-muted/30 p-4'>
                    {selectedTransaction.automation_id && (
                      <div className='flex items-center justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-muted-foreground'>
                            Automation ID
                          </p>
                          <p className='truncate font-mono text-xs text-foreground'>
                            {selectedTransaction.automation_id}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 shrink-0'
                          onClick={() =>
                            copyToClipboard(
                              selectedTransaction.automation_id!,
                              'automation'
                            )
                          }
                        >
                          {copiedField === 'automation' ? (
                            <Check className='h-3.5 w-3.5 text-success' />
                          ) : (
                            <Copy className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </div>
                    )}

                    {selectedTransaction.reference_id && (
                      <div className='flex items-center justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-muted-foreground'>
                            Reference ID
                          </p>
                          <p className='truncate font-mono text-xs text-foreground'>
                            {selectedTransaction.reference_id}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 shrink-0'
                          onClick={() =>
                            copyToClipboard(
                              selectedTransaction.reference_id!,
                              'reference'
                            )
                          }
                        >
                          {copiedField === 'reference' ? (
                            <Check className='h-3.5 w-3.5 text-success' />
                          ) : (
                            <Copy className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </div>
                    )}

                    {selectedTransaction.credit_package_id && (
                      <div className='flex items-center justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-muted-foreground'>
                            Package ID
                          </p>
                          <p className='truncate font-mono text-xs text-foreground'>
                            {selectedTransaction.credit_package_id}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 shrink-0'
                          onClick={() =>
                            copyToClipboard(
                              selectedTransaction.credit_package_id!,
                              'package'
                            )
                          }
                        >
                          {copiedField === 'package' ? (
                            <Check className='h-3.5 w-3.5 text-success' />
                          ) : (
                            <Copy className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </div>
                    )}

                    {selectedTransaction.order_id && (
                      <div className='flex items-center justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs text-muted-foreground'>
                            Order ID
                          </p>
                          <p className='truncate font-mono text-xs text-foreground'>
                            {selectedTransaction.order_id}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 shrink-0'
                          onClick={() =>
                            copyToClipboard(
                              selectedTransaction.order_id!,
                              'order'
                            )
                          }
                        >
                          {copiedField === 'order' ? (
                            <Check className='h-3.5 w-3.5 text-success' />
                          ) : (
                            <Copy className='h-3.5 w-3.5' />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Failure Reason - Only shown if exists */}
              {selectedTransaction.failure_reason && (
                <div className='space-y-2'>
                  <p className='text-xs font-medium uppercase tracking-wider text-destructive'>
                    Failure Details
                  </p>
                  <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-4'>
                    <p className='text-sm text-destructive'>
                      {selectedTransaction.failure_reason}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedTransaction.automation_id && (
                <Button
                  variant='outline'
                  className='w-full gap-2 bg-transparent'
                  asChild
                >
                  <a
                    href={`/automations?id=${selectedTransaction.automation_id}`}
                  >
                    <ExternalLink className='h-4 w-4' />
                    View Automation
                  </a>
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
