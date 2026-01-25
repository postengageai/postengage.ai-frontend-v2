import { httpClient, SuccessResponse } from '../http/client';

export interface CreateSupportTicketRequest {
  category: string;
  subject: string;
  message: string;
}

export interface CreateSupportTicketResponse {
  success: boolean;
  message: string;
}

const SUPPORT_BASE_URL = '/api/v1/support';

export class SupportApi {
  static async createTicket(
    request: CreateSupportTicketRequest
  ): Promise<SuccessResponse<CreateSupportTicketResponse>> {
    const response = await httpClient.post<CreateSupportTicketResponse>(
      `${SUPPORT_BASE_URL}/ticket`,
      request
    );

    return response.data!;
  }
}
