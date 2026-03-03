import { httpClient, SuccessResponse } from '../http/client';
import {
  CreateOrderDto,
  CreateOrderResponse,
  VerifyPaymentDto,
  VerifyPaymentResponse,
  PaymentRecord,
  Plan,
} from '../types/payment';

interface PaymentHistoryResponse {
  payments: PaymentRecord[];
}

export class PaymentsApi {
  /**
   * Create a Razorpay payment order
   * POST /api/payments/orders
   */
  static async createOrder(
    data: CreateOrderDto
  ): Promise<SuccessResponse<CreateOrderResponse>> {
    const response = await httpClient.post<CreateOrderResponse>(
      '/api/payments/orders',
      data
    );
    return response.data!;
  }

  /**
   * Verify a payment after Razorpay checkout
   * POST /api/payments/verify
   */
  static async verifyPayment(
    data: VerifyPaymentDto
  ): Promise<SuccessResponse<VerifyPaymentResponse>> {
    const response = await httpClient.post<VerifyPaymentResponse>(
      '/api/payments/verify',
      data
    );
    return response.data!;
  }

  /**
   * Get payment history with pagination
   * GET /api/payments/history?page=&per_page=
   */
  static async getPaymentHistory(
    page: number = 1,
    per_page: number = 10
  ): Promise<SuccessResponse<PaymentHistoryResponse>> {
    const response = await httpClient.get<PaymentHistoryResponse>(
      '/api/payments/history',
      {
        params: {
          page,
          per_page,
        },
      }
    );
    return response.data!;
  }

  /**
   * Get available subscription plans
   * GET /api/payments/plans
   */
  static async getPlans(): Promise<SuccessResponse<Plan[]>> {
    const response = await httpClient.get<Plan[]>('/api/payments/plans');
    return response.data!;
  }
}

// Create a singleton instance for convenience
export const paymentsApi = new PaymentsApi();
