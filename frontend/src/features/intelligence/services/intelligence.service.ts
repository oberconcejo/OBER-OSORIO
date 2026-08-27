import { axiosInstance } from '../../../lib/axios';

export interface IntelligenceModel {
  id: string;
  name: string;
  version: string;
  type: string; // ANOMALY, FORECAST, SIMULATION
  algorithm: string;
  metrics_json?: string;
  status: string;
  created_at: string;
}

export interface AnomalyAlert {
  id: string;
  type: string; // VOTE_SPIKE, LATENCY_DROP, PARTICIPATION_ANOMALY, etc.
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL
  score: number; // 0 to 100
  description: string;
  context_json?: string;
  status: string; // DETECTED, IN_REVIEW, CONFIRMED, DISMISSED
  reviewed_by?: string;
  reviewer?: any;
  resolution_note?: string;
  detected_at: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  parameters_json: string;
  result_json: string;
  created_at: string;
}

export interface AssistantResponse {
  answer: string;
  safety_status: 'CLEAN' | 'BLOCKED';
}

export const intelligenceService = {
  getModels: async (): Promise<IntelligenceModel[]> => {
    const res = await axiosInstance.get('/intelligence/models');
    return res.data.data || res.data;
  },

  registerModel: async (data: Partial<IntelligenceModel>): Promise<IntelligenceModel> => {
    const res = await axiosInstance.post('/intelligence/models', data);
    return res.data.data || res.data;
  },

  getAlerts: async (): Promise<AnomalyAlert[]> => {
    const res = await axiosInstance.get('/intelligence/alerts');
    return res.data.data || res.data;
  },

  resolveAlert: async (id: string, status: string, note: string): Promise<AnomalyAlert> => {
    const res = await axiosInstance.patch(`/intelligence/alerts/${id}/resolve`, { status, resolution_note: note });
    return res.data.data || res.data;
  },

  triggerAnomalyCheck: async (): Promise<any> => {
    const res = await axiosInstance.post('/intelligence/alerts/trigger');
    return res.data.data || res.data;
  },

  getSimulations: async (): Promise<SimulationScenario[]> => {
    const res = await axiosInstance.get('/intelligence/simulations');
    return res.data.data || res.data;
  },

  runSimulation: async (name: string, params: Record<string, any>): Promise<any> => {
    const res = await axiosInstance.post('/intelligence/simulations', {
      name,
      parameters_json: JSON.stringify(params),
    });
    return res.data.data || res.data;
  },

  queryAssistant: async (prompt: string): Promise<AssistantResponse> => {
    const res = await axiosInstance.post('/intelligence/chat', { prompt });
    return res.data.data || res.data;
  }
};
