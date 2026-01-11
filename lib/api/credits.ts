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
  ): Promise<SuccessResponse<TransactionsResponse>> {
    const response = await httpClient.get<TransactionsResponse>(
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

  // Get invoices (if available)
  static async getInvoices(
    query?: PaginationDto
  ): Promise<SuccessResponse<TransactionsResponse>> {
    const response = await httpClient.get<TransactionsResponse>(
      `${CREDITS_BASE_URL}/invoices`,
      { params: query }
    );
    return response.data!;
  }
}
