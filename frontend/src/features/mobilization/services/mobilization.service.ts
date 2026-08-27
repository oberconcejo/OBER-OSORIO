import { axiosInstance } from '../../../lib/axios';

export interface Operation {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: string;
  priority: string;
  days?: OperationDay[];
  activities?: MobilizationActivity[];
  incidents?: Incident[];
}

export interface OperationDay {
  id: string;
  operation_id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  description?: string;
  activities?: MobilizationActivity[];
}

export interface MobilizationActivity {
  id: string;
  operation_id: string;
  operation_day_id?: string;
  name: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  start_date_time: string;
  end_date_time: string;
  completed_at?: string;
  municipality_id?: string;
  zone_id?: string;
  polling_station_id?: string;
  polling_table_id?: string;
  assigned_to_id?: string;
  assigned_to?: any;
  municipality?: any;
  zone?: any;
  polling_station?: any;
  polling_table?: any;
}

export interface Incident {
  id: string;
  operation_id?: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  reported_by_id: string;
  reported_by?: any;
  assignments?: any[];
  history?: any[];
  municipality_id?: string;
  zone_id?: string;
  polling_station_id?: string;
  polling_table_id?: string;
  municipality?: any;
  zone?: any;
  polling_station?: any;
  created_at: string;
  resolved_at?: string;
}

export interface OperationalResource {
  id: string;
  name: string;
  type: string;
  quantity: number;
  status: string;
  notes?: string;
  assignments?: any[];
  municipality_id?: string;
  zone_id?: string;
  polling_station_id?: string;
  municipality?: any;
  zone?: any;
  polling_station?: any;
}

export interface OperationalPoint {
  id: string;
  name: string;
  type: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  responsible_id?: string;
  responsible?: any;
  status: string;
  municipality_id?: string;
  zone_id?: string;
  polling_station_id?: string;
  municipality?: any;
  zone?: any;
  polling_station?: any;
}

export interface MobilizationDashboardStats {
  operations_active: number;
  activities_today: number;
  activities_pending: number;
  activities_in_progress: number;
  activities_completed: number;
  activities_overdue: number;
  incidents_open: number;
  critical_incidents: number;
  operational_points: number;
  active_members: number;
  alert_level: string; // NORMAL, ATENCION, CRITICO
  coverage_percentage: number;
}

export const mobilizationService = {
  getDashboard: async (): Promise<MobilizationDashboardStats> => {
    const res = await axiosInstance.get('/mobilization/dashboard');
    return res.data.data || res.data;
  },

  getOperations: async (): Promise<Operation[]> => {
    const res = await axiosInstance.get('/mobilization/operations');
    return res.data.data || res.data;
  },

  getOperationById: async (id: string): Promise<Operation> => {
    const res = await axiosInstance.get(`/mobilization/operations/${id}`);
    return res.data.data || res.data;
  },

  createOperation: async (data: Partial<Operation>): Promise<Operation> => {
    const res = await axiosInstance.post('/mobilization/operations', data);
    return res.data.data || res.data;
  },

  updateOperation: async (id: string, data: Partial<Operation>): Promise<Operation> => {
    const res = await axiosInstance.patch(`/mobilization/operations/${id}`, data);
    return res.data.data || res.data;
  },

  deleteOperation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/mobilization/operations/${id}`);
  },

  createOperationDay: async (data: Partial<OperationDay>): Promise<OperationDay> => {
    const res = await axiosInstance.post('/mobilization/days', data);
    return res.data.data || res.data;
  },

  createActivity: async (data: Partial<MobilizationActivity>): Promise<MobilizationActivity> => {
    const res = await axiosInstance.post('/mobilization/activities', data);
    return res.data.data || res.data;
  },

  getActivities: async (): Promise<MobilizationActivity[]> => {
    const res = await axiosInstance.get('/mobilization/activities');
    return res.data.data || res.data;
  },

  updateActivity: async (id: string, data: Partial<MobilizationActivity>): Promise<MobilizationActivity> => {
    const res = await axiosInstance.patch(`/mobilization/activities/${id}`, data);
    return res.data.data || res.data;
  },

  getIncidents: async (): Promise<Incident[]> => {
    const res = await axiosInstance.get('/mobilization/incidents');
    return res.data.data || res.data;
  },

  createIncident: async (data: Partial<Incident>): Promise<Incident> => {
    const res = await axiosInstance.post('/mobilization/incidents', data);
    return res.data.data || res.data;
  },

  updateIncident: async (id: string, data: Partial<Incident>): Promise<Incident> => {
    const res = await axiosInstance.patch(`/mobilization/incidents/${id}`, data);
    return res.data.data || res.data;
  },

  assignIncident: async (incidentId: string, memberId: string): Promise<any> => {
    const res = await axiosInstance.post(`/mobilization/incidents/${incidentId}/assign`, { member_id: memberId });
    return res.data.data || res.data;
  },

  getResources: async (): Promise<OperationalResource[]> => {
    const res = await axiosInstance.get('/mobilization/resources');
    return res.data.data || res.data;
  },

  createResource: async (data: Partial<OperationalResource>): Promise<OperationalResource> => {
    const res = await axiosInstance.post('/mobilization/resources', data);
    return res.data.data || res.data;
  },

  assignResource: async (resourceId: string, memberId: string, quantity: number): Promise<any> => {
    const res = await axiosInstance.post(`/mobilization/resources/${resourceId}/assign`, { member_id: memberId, quantity });
    return res.data.data || res.data;
  },

  releaseResource: async (assignmentId: string): Promise<void> => {
    await axiosInstance.delete(`/mobilization/resources/assignments/${assignmentId}`);
  },

  getPoints: async (): Promise<OperationalPoint[]> => {
    const res = await axiosInstance.get('/mobilization/points');
    return res.data.data || res.data;
  },

  createPoint: async (data: Partial<OperationalPoint>): Promise<OperationalPoint> => {
    const res = await axiosInstance.post('/mobilization/points', data);
    return res.data.data || res.data;
  }
};
