import { create } from 'zustand';
import {
  VoiceDna,
  CreateVoiceDnaDto,
  AddFewShotDto,
  AddNegativeExampleDto,
} from '../types/voice-dna';
import { VoiceDnaApi } from '../api/voice-dna';

interface VoiceDnaState {
  voiceDnaList: VoiceDna[];
  selectedVoiceDna: VoiceDna | null;
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchAll: () => Promise<void>;
    fetchByBrandVoice: (brandVoiceId: string) => Promise<VoiceDna | null>;
    fetchById: (id: string) => Promise<void>;
    create: (dto: CreateVoiceDnaDto) => Promise<VoiceDna>;
    addFewShot: (id: string, dto: AddFewShotDto) => Promise<void>;
    deleteFewShot: (id: string, index: number) => Promise<void>;
    addNegative: (id: string, dto: AddNegativeExampleDto) => Promise<void>;
    deleteNegative: (id: string, index: number) => Promise<void>;
    triggerReanalyze: (id: string) => Promise<void>;
    deleteVoiceDna: (id: string) => Promise<void>;
    setSelected: (voiceDna: VoiceDna | null) => void;
    updateInList: (voiceDna: VoiceDna) => void;
    reset: () => void;
  };
}

export const useVoiceDnaStore = create<VoiceDnaState>(set => ({
  voiceDnaList: [],
  selectedVoiceDna: null,
  isLoading: false,
  error: null,

  actions: {
    fetchAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await VoiceDnaApi.listVoiceDna();
        set({ voiceDnaList: response.data, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch Voice DNA list';
        set({ error: errorMessage, isLoading: false });
      }
    },

    fetchById: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await VoiceDnaApi.getVoiceDna(id);
        set({ selectedVoiceDna: response.data, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch Voice DNA';
        set({ error: errorMessage, isLoading: false });
      }
    },

    fetchByBrandVoice: async (brandVoiceId: string) => {
      try {
        const response =
          await VoiceDnaApi.getVoiceDnaByBrandVoice(brandVoiceId);
        return response.data;
      } catch {
        return null;
      }
    },

    create: async (dto: CreateVoiceDnaDto) => {
      set({ isLoading: true, error: null });
      try {
        const response = await VoiceDnaApi.createVoiceDna(dto);
        const newVoiceDna = response.data;
        set(state => ({
          voiceDnaList: [...state.voiceDnaList, newVoiceDna],
          isLoading: false,
        }));
        return newVoiceDna;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create Voice DNA';
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },

    addFewShot: async (id: string, dto: AddFewShotDto) => {
      try {
        const response = await VoiceDnaApi.addFewShotExample(id, dto);
        const updated = response.data;
        set(state => ({
          selectedVoiceDna:
            state.selectedVoiceDna?._id === id
              ? updated
              : state.selectedVoiceDna,
          voiceDnaList: state.voiceDnaList.map(v =>
            v._id === id ? updated : v
          ),
        }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add example';
        set({ error: errorMessage });
        throw error;
      }
    },

    deleteFewShot: async (id: string, index: number) => {
      try {
        const response = await VoiceDnaApi.deleteFewShotExample(id, index);
        const updated = response.data;
        set(state => ({
          selectedVoiceDna:
            state.selectedVoiceDna?._id === id
              ? updated
              : state.selectedVoiceDna,
          voiceDnaList: state.voiceDnaList.map(v =>
            v._id === id ? updated : v
          ),
        }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete example';
        set({ error: errorMessage });
        throw error;
      }
    },

    addNegative: async (id: string, dto: AddNegativeExampleDto) => {
      try {
        const response = await VoiceDnaApi.addNegativeExample(id, dto);
        const updated = response.data;
        set(state => ({
          selectedVoiceDna:
            state.selectedVoiceDna?._id === id
              ? updated
              : state.selectedVoiceDna,
          voiceDnaList: state.voiceDnaList.map(v =>
            v._id === id ? updated : v
          ),
        }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to add negative example';
        set({ error: errorMessage });
        throw error;
      }
    },

    deleteNegative: async (id: string, index: number) => {
      try {
        const response = await VoiceDnaApi.deleteNegativeExample(id, index);
        const updated = response.data;
        set(state => ({
          selectedVoiceDna:
            state.selectedVoiceDna?._id === id
              ? updated
              : state.selectedVoiceDna,
          voiceDnaList: state.voiceDnaList.map(v =>
            v._id === id ? updated : v
          ),
        }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to delete negative example';
        set({ error: errorMessage });
        throw error;
      }
    },

    triggerReanalyze: async (id: string) => {
      try {
        const response = await VoiceDnaApi.reanalyzeVoiceDna(id);
        const updated = response.data;
        set(state => ({
          selectedVoiceDna:
            state.selectedVoiceDna?._id === id
              ? updated
              : state.selectedVoiceDna,
          voiceDnaList: state.voiceDnaList.map(v =>
            v._id === id ? updated : v
          ),
        }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to trigger re-analysis';
        set({ error: errorMessage });
        throw error;
      }
    },

    deleteVoiceDna: async (id: string) => {
      try {
        await VoiceDnaApi.deleteVoiceDna(id);
        set(state => ({
          voiceDnaList: state.voiceDnaList.filter(v => v._id !== id),
          selectedVoiceDna:
            state.selectedVoiceDna?._id === id ? null : state.selectedVoiceDna,
        }));
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete Voice DNA';
        set({ error: errorMessage });
        throw error;
      }
    },

    setSelected: (voiceDna: VoiceDna | null) =>
      set({ selectedVoiceDna: voiceDna }),

    updateInList: (voiceDna: VoiceDna) =>
      set(state => ({
        voiceDnaList: state.voiceDnaList.map(v =>
          v._id === voiceDna._id ? voiceDna : v
        ),
        selectedVoiceDna:
          state.selectedVoiceDna?._id === voiceDna._id
            ? voiceDna
            : state.selectedVoiceDna,
      })),

    reset: () =>
      set({
        voiceDnaList: [],
        selectedVoiceDna: null,
        isLoading: false,
        error: null,
      }),
  },
}));

// Selector hooks
export const useVoiceDnaList = () =>
  useVoiceDnaStore(state => state.voiceDnaList);
export const useSelectedVoiceDna = () =>
  useVoiceDnaStore(state => state.selectedVoiceDna);
export const useVoiceDnaLoading = () =>
  useVoiceDnaStore(state => state.isLoading);
export const useVoiceDnaError = () => useVoiceDnaStore(state => state.error);
export const useVoiceDnaActions = () =>
  useVoiceDnaStore(state => state.actions);
