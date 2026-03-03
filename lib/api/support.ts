import { httpClient, SuccessResponse } from '../http/client';
import { SupportTicket, CreateTicketDto } from '../types/support';

const SUPPORT_BASE_URL = '/api/support';

export class SupportApi {
  // Create support ticket
  static async createTicket(
    request: CreateTicketDto
  ): Promise<SuccessResponse<SupportTicket>> {
    const response = await httpClient.post<SupportTicket>(
      SUPPORT_BASE_URL,
      request
    );

    return response.data!;
  }
}

// Hook-friendly API functions
export const supportApi = {
  createTicket: SupportApi.createTicket,
};
