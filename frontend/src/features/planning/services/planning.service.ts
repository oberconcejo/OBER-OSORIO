import { axiosInstance } from '../../../lib/axios';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: string;
  priority: string;
  municipality_id?: string;
  zone_id?: string;
  polling_station_id?: string;
  created_at: string;
  objectives?: Objective[];
  activities?: Activity[];
  municipality?: any;
  zone?: any;
  polling_station?: any;
}

export interface Objective {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee_id?: string;
  activities?: Activity[];
  assignee?: any;
}

export interface Activity {
  id: string;
  plan_id: string;
  objective_id?: string;
  name: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  start_date: string;
  due_date: string;
  completed_at?: string;
  municipality_id?: string;
  zone_id?: string;
  polling_station_id?: string;
  polling_table_id?: string;
  assignees?: { member: any }[];
  dependencies?: { depends_on: any }[];
  checklist?: { id: string; title: string; is_completed: boolean }[];
  comments?: { id: string; content: string; created_at: string; user: { name: string } }[];
  evidence?: { id: string; file_name: string; file_url: string }[];
  municipality?: any;
  zone?: any;
  polling_station?: any;
  polling_table?: any;
}

export interface PlanningDashboardStats {
  plans_active: number;
  activities_pending: number;
  activities_in_progress: number;
  activities_completed: number;
  activities_overdue: number;
  active_members: number;
  territories_with_plans: number;
  percentage_completed: number;
}

export const planningService = {
  getDashboard: async (): Promise<PlanningDashboardStats> => {
    const res = await axiosInstance.get('/planning/dashboard');
    return res.data.data || res.data;
  },

  getPlans: async (): Promise<Plan[]> => {
    const res = await axiosInstance.get('/plans');
    return res.data.data || res.data;
  },

  getPlanById: async (id: string): Promise<Plan> => {
    const res = await axiosInstance.get(`/plans/${id}`);
    return res.data.data || res.data;
  },

  createPlan: async (data: Partial<Plan>): Promise<Plan> => {
    const res = await axiosInstance.post('/plans', data);
    return res.data.data || res.data;
  },

  updatePlan: async (id: string, data: Partial<Plan>): Promise<Plan> => {
    const res = await axiosInstance.patch(`/plans/${id}`, data);
    return res.data.data || res.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/plans/${id}`);
  },

  createObjective: async (planId: string, data: Partial<Objective>): Promise<Objective> => {
    const res = await axiosInstance.post(`/plans/${planId}/objectives`, data);
    return res.data.data || res.data;
  },

  updateObjective: async (id: string, data: Partial<Objective>): Promise<Objective> => {
    const res = await axiosInstance.patch(`/objectives/${id}`, data);
    return res.data.data || res.data;
  },

  deleteObjective: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/objectives/${id}`);
  },

  getActivities: async (): Promise<Activity[]> => {
    const res = await axiosInstance.get('/activities');
    return res.data.data || res.data;
  },

  getActivityById: async (id: string): Promise<Activity> => {
    const res = await axiosInstance.get(`/activities/${id}`);
    return res.data.data || res.data;
  },

  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const res = await axiosInstance.post('/activities', data);
    return res.data.data || res.data;
  },

  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    const res = await axiosInstance.patch(`/activities/${id}`, data);
    return res.data.data || res.data;
  },

  deleteActivity: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/activities/${id}`);
  },

  updateActivityStatus: async (id: string, status: string): Promise<Activity> => {
    const res = await axiosInstance.patch(`/activities/${id}/status`, { status });
    return res.data.data || res.data;
  },

  addChecklistItem: async (id: string, title: string) => {
    const res = await axiosInstance.post(`/activities/${id}/checklist`, { title });
    return res.data.data || res.data;
  },

  toggleChecklistItem: async (itemId: string, is_completed: boolean) => {
    const res = await axiosInstance.patch(`/activities/checklist/${itemId}`, { is_completed });
    return res.data.data || res.data;
  },

  addComment: async (id: string, content: string) => {
    const res = await axiosInstance.post(`/activities/${id}/comments`, { content });
    return res.data.data || res.data;
  },

  addEvidence: async (id: string, fileName: string, fileUrl: string) => {
    const res = await axiosInstance.post(`/activities/${id}/evidence`, { file_name: fileName, file_url: fileUrl });
    return res.data.data || res.data;
  }
};
