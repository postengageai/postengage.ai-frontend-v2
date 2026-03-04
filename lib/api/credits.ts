import { httpClient, SuccessResponse } from '../http/client';
import {
  CreditBalance,
  CreditTransactionsResponse,
  UsageBreakdown,
} from '../types/credits';

const CREDITS_BASE_URL = '/api/v1/credits';

export interface TransactionParams {
  page?: number;
  limit?: number;
  type?: string;
  date_from?: string;
  date_to?: string;
}

export interface UsageParams {
  days?: number;
  from?: string;
  to?: string;
}

export class CreditsApi {
  /**
   * Get user's current credit balance
   */
  static async getBalance(): Promise<SuccessResponse<CreditBalance>> {
    const response = await httpClient.get<CreditBalance>(
      `${CREDITS_BASE_URL}/balance`
    );
    return response.data!;
  }

  /**
   * Get credit transaction history with pagination
   */
  static async getTransactions(
    params?: TransactionParams
  ): Promise<SuccessResponse<CreditTransactionsResponse>> {
    const response = await httpClient.get<CreditTransactionsResponse>(
      `${CREDITS_BASE_URL}/transactions`,
      { params }
    );
    return response.data!;
  }

  /**
   * Get detailed credit usage breakdown by feature
   */
  static async getUsage(
    params?: UsageParams
  ): Promise<SuccessResponse<UsageBreakdown>> {
    const response = await httpClient.get<UsageBreakdown>(
      `${CREDITS_BASE_URL}/usage`,
      { params }
    );
    return response.data!;
  }
}

export const creditsApi = CreditsApi;
