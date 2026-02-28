import { httpClient, SuccessResponse } from '../http/client';
import {
  VoiceDna,
  CreateVoiceDnaDto,
  AddFewShotDto,
  AddNegativeExampleDto,
  TriggerAutoInferDto,
  AutoInferResult,
  VoiceReview,
  VoiceFeedbackDto,
  AdjustVoiceDto,
  ContinuousLearningStats,
  GenerateSampleReplyDto,
  SampleReplyResult,
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

  // === Phase 5: Auto-Inference & Voice Review ===

  // Trigger auto-inference
  static async triggerAutoInfer(
    data: TriggerAutoInferDto
  ): Promise<SuccessResponse<AutoInferResult>> {
    const response = await httpClient.post<AutoInferResult>(
      `${VOICE_DNA_BASE_URL}/auto-infer`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Get voice review (human-readable summary)
  static async getVoiceReview(
    voiceDnaId: string
  ): Promise<SuccessResponse<VoiceReview>> {
    const response = await httpClient.get<VoiceReview>(
      `${VOICE_DNA_BASE_URL}/${voiceDnaId}/review`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Submit voice feedback
  static async submitVoiceFeedback(
    data: VoiceFeedbackDto
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.post<void>(
      `${VOICE_DNA_BASE_URL}/feedback`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Adjust voice (tone sliders, add/remove examples)
  static async adjustVoice(
    voiceDnaId: string,
    data: AdjustVoiceDto
  ): Promise<SuccessResponse<VoiceDna>> {
    const response = await httpClient.post<VoiceDna>(
      `${VOICE_DNA_BASE_URL}/${voiceDnaId}/adjust`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Get continuous learning stats
  static async getContinuousLearningStats(
    voiceDnaId: string
  ): Promise<SuccessResponse<ContinuousLearningStats>> {
    const response = await httpClient.get<ContinuousLearningStats>(
      `${VOICE_DNA_BASE_URL}/${voiceDnaId}/learning`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Generate sample reply (dry-run)
  static async generateSampleReply(
    data: GenerateSampleReplyDto
  ): Promise<SuccessResponse<SampleReplyResult>> {
    const response = await httpClient.post<SampleReplyResult>(
      `${VOICE_DNA_BASE_URL}/sample-reply`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }
}
