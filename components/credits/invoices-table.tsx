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
import type {
  Invoice,
  InvoiceStatus,
  PaymentProvider,
} from '@/lib/types/credits';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Mail,
  CreditCard,
  Receipt,
  Building2,
} from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  total: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  pageSize?: number;
}

export function InvoicesTable({
  invoices,
  total,
  isLoading,
  onPageChange,
  currentPage = 1,
  pageSize = 10,
}: InvoicesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getProviderIcon = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className='h-4 w-4' />;
      case 'razorpay':
        return <Building2 className='h-4 w-4' />;
      case 'paypal':
        return <Receipt className='h-4 w-4' />;
    }
  };

  const getProviderLabel = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return 'Stripe';
      case 'razorpay':
        return 'Razorpay';
      case 'paypal':
        return 'PayPal';
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'succeeded':
        return (
          <Badge
            variant='outline'
            className='border-success/30 bg-success/10 text-success'
          >
            Succeeded
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
      case 'failed':
        return (
          <Badge
            variant='outline'
            className='border-destructive/30 bg-destructive/10 text-destructive'
          >
            Failed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge
            variant='outline'
            className='border-muted-foreground/30 bg-muted/50 text-muted-foreground'
          >
            Refunded
          </Badge>
        );
      case 'partially_refunded':
        return (
          <Badge
            variant='outline'
            className='border-chart-3/30 bg-chart-3/10 text-chart-3'
          >
            Partial Refund
          </Badge>
        );
    }
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
            Invoices & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className='flex h-32 flex-col items-center justify-center gap-2'>
              <Receipt className='h-8 w-8 text-muted-foreground/50' />
              <p className='text-sm text-muted-foreground'>No invoices yet.</p>
              <p className='text-xs text-muted-foreground/70'>
                Your payment history will appear here.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='hover:bg-transparent'>
                    <TableHead className='w-[140px]'>Invoice</TableHead>
                    <TableHead className='w-[100px]'>Date</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead className='w-[100px]'>Provider</TableHead>
                    <TableHead className='text-right w-[100px]'>
                      Amount
                    </TableHead>
                    <TableHead className='text-right w-[80px]'>
                      Credits
                    </TableHead>
                    <TableHead className='w-[120px]'>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow
                      key={invoice._id}
                      className='cursor-pointer'
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <TableCell className='font-mono text-sm text-foreground'>
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {formatDate(invoice.paid_at || invoice.created_at)}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {invoice.package_name}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          {getProviderIcon(invoice.payment_provider)}
                          <span className='text-sm'>
                            {getProviderLabel(invoice.payment_provider)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right font-mono text-sm'>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell className='text-right font-mono text-sm text-muted-foreground'>
                        +{invoice.credits_purchased.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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

      {/* Invoice Detail Drawer */}
      <Sheet
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <SheetContent className='w-full border-border bg-background sm:max-w-lg overflow-y-auto'>
          <SheetHeader className='space-y-1 pb-4'>
            <SheetTitle className='text-lg font-semibold'>
              Invoice Details
            </SheetTitle>
          </SheetHeader>

          {selectedInvoice && (
            <div className='space-y-6 px-4'>
              {/* Invoice Header - PDF/Email friendly */}
              <div className='rounded-xl border border-border bg-card p-6'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <p className='font-mono text-sm text-muted-foreground'>
                      {selectedInvoice.invoice_number}
                    </p>
                    <p className='text-2xl font-semibold text-foreground'>
                      {formatCurrency(
                        selectedInvoice.amount,
                        selectedInvoice.currency
                      )}
                    </p>
                    {selectedInvoice.refund_amount &&
                      selectedInvoice.refund_amount > 0 && (
                        <p className='text-sm text-muted-foreground'>
                          Refunded:{' '}
                          {formatCurrency(
                            selectedInvoice.refund_amount,
                            selectedInvoice.currency
                          )}
                        </p>
                      )}
                  </div>
                  <div className='text-right'>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>

                <Separator className='my-4' />

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs font-medium text-muted-foreground'>
                      Package
                    </p>
                    <p className='mt-1 text-sm text-foreground'>
                      {selectedInvoice.package_name}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-medium text-muted-foreground'>
                      Credits
                    </p>
                    <p className='mt-1 font-mono text-sm text-success'>
                      +{selectedInvoice.credits_purchased.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className='space-y-3'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Payment Information
                </p>
                <div className='space-y-3 rounded-lg border border-border bg-muted/30 p-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm text-muted-foreground'>Provider</p>
                    <div className='flex items-center gap-2'>
                      {getProviderIcon(selectedInvoice.payment_provider)}
                      <span className='text-sm font-medium'>
                        {getProviderLabel(selectedInvoice.payment_provider)}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='text-sm text-muted-foreground'>Payment ID</p>
                    <div className='flex items-center gap-1'>
                      <span className='font-mono text-xs text-foreground truncate max-w-[180px]'>
                        {selectedInvoice.payment_id}
                      </span>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 shrink-0'
                        onClick={() =>
                          copyToClipboard(
                            selectedInvoice.payment_id,
                            'payment_id'
                          )
                        }
                      >
                        {copiedField === 'payment_id' ? (
                          <Check className='h-3 w-3 text-success' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                      </Button>
                    </div>
                  </div>
                  {selectedInvoice.paid_at && (
                    <div className='flex items-center justify-between'>
                      <p className='text-sm text-muted-foreground'>Paid On</p>
                      <span className='text-sm'>
                        {formatFullDate(selectedInvoice.paid_at)}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.tax_amount !== undefined &&
                    selectedInvoice.tax_amount > 0 && (
                      <div className='flex items-center justify-between'>
                        <p className='text-sm text-muted-foreground'>Tax</p>
                        <span className='text-sm'>
                          {formatCurrency(
                            selectedInvoice.tax_amount,
                            selectedInvoice.currency
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Billing Details */}
              <div className='space-y-3'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Billing Details
                </p>
                <div className='space-y-2 rounded-lg border border-border bg-muted/30 p-4'>
                  {selectedInvoice.billing_name && (
                    <p className='text-sm font-medium text-foreground'>
                      {selectedInvoice.billing_name}
                    </p>
                  )}
                  <p className='text-sm text-muted-foreground'>
                    {selectedInvoice.billing_email}
                  </p>
                  {selectedInvoice.billing_address && (
                    <div className='text-sm text-muted-foreground'>
                      {selectedInvoice.billing_address.line1 && (
                        <p>{selectedInvoice.billing_address.line1}</p>
                      )}
                      {selectedInvoice.billing_address.line2 && (
                        <p>{selectedInvoice.billing_address.line2}</p>
                      )}
                      <p>
                        {[
                          selectedInvoice.billing_address.city,
                          selectedInvoice.billing_address.state,
                          selectedInvoice.billing_address.postal_code,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {selectedInvoice.billing_address.country && (
                        <p>{selectedInvoice.billing_address.country}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Details (if applicable) */}
              {(selectedInvoice.status === 'refunded' ||
                selectedInvoice.status === 'partially_refunded') &&
                selectedInvoice.refund_amount && (
                  <div className='space-y-3'>
                    <p className='text-xs font-medium uppercase tracking-wider text-chart-3'>
                      Refund Information
                    </p>
                    <div className='space-y-2 rounded-lg border border-chart-3/30 bg-chart-3/5 p-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm text-muted-foreground'>
                          Refund Amount
                        </p>
                        <span className='font-mono text-sm font-medium'>
                          {formatCurrency(
                            selectedInvoice.refund_amount,
                            selectedInvoice.currency
                          )}
                        </span>
                      </div>
                      {selectedInvoice.refunded_at && (
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-muted-foreground'>
                            Refunded On
                          </p>
                          <span className='text-sm'>
                            {formatDate(selectedInvoice.refunded_at)}
                          </span>
                        </div>
                      )}
                      {selectedInvoice.refund_reason && (
                        <div className='pt-2'>
                          <p className='text-xs text-muted-foreground'>
                            Reason
                          </p>
                          <p className='mt-1 text-sm text-foreground'>
                            {selectedInvoice.refund_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className='flex gap-2 pt-2'>
                <Button
                  variant='outline'
                  className='flex-1 gap-2 bg-transparent'
                >
                  <Download className='h-4 w-4' />
                  Download PDF
                </Button>
                <Button
                  variant='outline'
                  className='flex-1 gap-2 bg-transparent'
                >
                  <Mail className='h-4 w-4' />
                  Email Invoice
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
