import { httpClient, SuccessResponse } from '../http/client';
import { CreditTransaction, CreditUsage } from '../types/credits';

const CREDITS_BASE_URL = '/api/v1/credits';

export interface GetCreditUsageDto {
  days?: number;
  from?: string;
  to?: string;
}

export interface PaginationDto {
  limit?: number;
  skip?: number;
  page?: number;
}

export interface TransactionsResponse {
  transactions: CreditTransaction[];
  meta: {
    total: number;
    limit: number;
    skip: number;
    page: number;
    totalPages: number;
  };
}

export interface BalanceResponse {
  available_credits: number;
}

export interface Invoice {
  _id: string;
  invoice_number: string;
  package_name: string;
  credits_purchased: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency_code: string;
  currency_symbol: string;
  tax_rate_percent: number;
  status: 'paid' | 'pending' | 'refunded';
  payment_provider?: string;
  provider_payment_id?: string;
  paid_at?: string;
  created_at: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export class CreditsApi {
  // Get current credit balance
  static async getBalance(): Promise<SuccessResponse<BalanceResponse>> {
    const response = await httpClient.get<BalanceResponse>(
      `${CREDITS_BASE_URL}/balance`
    );
    return response.data!;
  }

  // Get credit transactions with pagination
  static async getTransactions(
    query?: PaginationDto
  ): Promise<SuccessResponse<CreditTransaction[]>> {
    const response = await httpClient.get<CreditTransaction[]>(
      `${CREDITS_BASE_URL}/transactions`,
      { params: query }
    );
    return response.data!;
  }

  // Get credit usage analytics
  static async getUsage(
    query?: GetCreditUsageDto
  ): Promise<SuccessResponse<CreditUsage>> {
    const response = await httpClient.get<CreditUsage>(
      `${CREDITS_BASE_URL}/usage`,
      { params: query }
    );
    return response.data!;
  }

  // ── Invoice methods ──────────────────────────────────────────────────────

  static async getInvoices(query?: PaginationDto): Promise<InvoicesResponse> {
    const response = await httpClient.get<InvoicesResponse>(
      `${CREDITS_BASE_URL}/invoices`,
      { params: query }
    );
    return response.data!.data as unknown as InvoicesResponse;
  }

  static downloadInvoice(invoiceId: string): void {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
    window.open(
      `${apiUrl}/api/v1/credits/invoices/${invoiceId}/download`,
      '_blank'
    );
  }

  static async emailInvoice(
    invoiceId: string
  ): Promise<SuccessResponse<{ message: string }>> {
    const response = await httpClient.post<{ message: string }>(
      `${CREDITS_BASE_URL}/invoices/${invoiceId}/email`
    );
    return response.data!;
  }
}
