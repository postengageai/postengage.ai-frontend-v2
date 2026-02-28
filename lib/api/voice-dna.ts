import { httpClient, SuccessResponse } from '../http/client';
import {
  VoiceDna,
  CreateVoiceDnaDto,
  AddFewShotDto,
  AddNegativeExampleDto,
} from '../types/voice-dna';

const VOICE_DNA_BASE_URL = '/api/v1/intelligence/voice-dna';

export class VoiceDnaApi {
  // List all Voice DNA records
  static async listVoiceDna(): Promise<SuccessResponse<VoiceDna[]>> {
    const response = await httpClient.get<VoiceDna[]>(VOICE_DNA_BASE_URL);
    if (response.error) throw response.error;
    return response.data;
  }

  // Get a single Voice DNA by ID
  static async getVoiceDna(id: string): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.get<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${id}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Get Voice DNA by brand voice ID
  static async getVoiceDnaByBrandVoice(
    brandVoiceId: string
  ): Promise<SuccessResponse<VoiceDna | null>> {
    const response = await httpClient.get<VoiceDna | null>(
      `${VOICE_DNA_BASE_URL}/brand-voice/${brandVoiceId}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Create a new Voice DNA
  static async createVoiceDna(
    data: CreateVoiceDnaDto
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.post<VoiceDna>(VOICE_DNA_BASE_URL, data);
    if (response.error) throw response.error;
    return response.data;
  }

  // Add a few-shot example
  static async addFewShotExample(
    id: string,
    data: AddFewShotDto
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.post<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${id}/few-shot`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Delete a few-shot example by index
  static async deleteFewShotExample(
    id: string,
    index: number
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.delete<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${id}/few-shot/${index}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Add a negative example
  static async addNegativeExample(
    id: string,
    data: AddNegativeExampleDto
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.post<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${id}/negative-example`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Delete a negative example by index
  static async deleteNegativeExample(
    id: string,
    index: number
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.delete<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${id}/negative-example/${index}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Trigger re-analysis
  static async reanalyzeVoiceDna(
    id: string
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.post<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${id}/reanalyze`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Delete a Voice DNA record
  static async deleteVoiceDna(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${VOICE_DNA_BASE_URL}/${id}`
    );
    if (response.error) throw response.error;
    return response.data;
  }
}
