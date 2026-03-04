import { httpClient, SuccessResponse } from '../http/client';
import {
  CreateOrderDto,
  CreateOrderResponse,
  VerifyPaymentDto,
  VerifyPaymentResponse,
  PaymentRecord,
  PackagesResponse,
} from '../types/payment';

interface PaymentHistoryResponse {
  data: PaymentRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class PaymentsApi {
  /**
   * Create a Razorpay payment order
   * POST /api/v1/payments/orders
   */
  static async createOrder(
    data: CreateOrderDto
  ): Promise<SuccessResponse<CreateOrderResponse>> {
    const response = await httpClient.post<CreateOrderResponse>(
      '/api/v1/payments/orders',
      data
    );
    return response.data!;
  }

  /**
   * Verify a payment after Razorpay checkout
   * POST /api/v1/payments/verify
   */
  static async verifyPayment(
    data: VerifyPaymentDto
  ): Promise<SuccessResponse<VerifyPaymentResponse>> {
    const response = await httpClient.post<VerifyPaymentResponse>(
      '/api/v1/payments/verify',
      data
    );
    return response.data!;
  }

  /**
   * Get payment history with pagination
   * GET /api/v1/payments/history?page=&per_page=
   * @deprecated Backend does not expose this endpoint yet. Use Credits API for transaction history.
   */
  // static async getPaymentHistory(
  //   page: number = 1,
  //   per_page: number = 10
  // ): Promise<SuccessResponse<PaymentHistoryResponse>> {
  //   const response = await httpClient.get<PaymentHistoryResponse>(
  //     '/api/v1/payments/history',
  //     {
  //       params: {
  //         page,
  //         per_page,
  //       },
  //     }
  //   );
  //   return response.data!;
  // }

  /**
   * Get available credit packages
   * GET /api/v1/payments/packages
   */
  static async getPackages(): Promise<SuccessResponse<PackagesResponse>> {
    const response = await httpClient.get<PackagesResponse>(
      '/api/v1/payments/packages'
    );
    return response.data!;
  }
}

// Create a singleton instance for convenience
export const paymentsApi = new PaymentsApi();
