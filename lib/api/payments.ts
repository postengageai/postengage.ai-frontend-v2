import { httpClient } from '../http/client';
import { CreateOrderDto, CreateOrderResponse } from '../types/payment';

export class PaymentsApi {
  static async createOrder(data: CreateOrderDto): Promise<CreateOrderResponse> {
    const response = await httpClient.post<CreateOrderResponse>(
      'api/v1/payments/orders',
      data
    );
    return response.data?.data!;
  }
}
