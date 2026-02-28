import { httpClient, SuccessResponse } from '../http/client';
import {
  CreateOrderDto,
  CreateOrderResponse,
  VerifyPaymentDto,
} from '../types/payment';

export interface VerifyPaymentResponse {
  success: boolean;
  credits_added: number;
  new_balance: number;
  transaction_id: string;
}

export class PaymentsApi {
  static async createOrder(data: CreateOrderDto): Promise<CreateOrderResponse> {
    const response = await httpClient.post<CreateOrderResponse>(
      'api/v1/payments/orders',
      data
    );
    return response.data?.data!;
  }

  static async verifyPayment(
    data: VerifyPaymentDto
  ): Promise<SuccessResponse<VerifyPaymentResponse>> {
    const response = await httpClient.post<VerifyPaymentResponse>(
      'api/v1/payments/verify',
      data
    );
    return response.data!;
  }
}
