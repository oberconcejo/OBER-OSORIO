import { axiosInstance } from '../../../lib/axios';

export interface TeamPosition {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
}

export interface CreatePositionDto {
  name: string;
}

export interface CreateMemberDto {
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export const teamService = {
  getPositions: async (): Promise<TeamPosition[]> => {
    const res = await axiosInstance.get('/team/positions');
    return res.data.data;
  },

  createPosition: async (data: CreatePositionDto): Promise<TeamPosition> => {
    const res = await axiosInstance.post('/team/positions', data);
    return res.data.data;
  },

  getMembers: async (): Promise<TeamMember[]> => {
    const res = await axiosInstance.get('/team/members');
    return res.data.data;
  },

  createMember: async (data: CreateMemberDto): Promise<TeamMember> => {
    const res = await axiosInstance.post('/team/members', data);
    return res.data.data;
  },

  getAssignments: async () => {
    const res = await axiosInstance.get('/team/assignments');
    return res.data.data;
  },

  assignTerritory: async (data: {
    member_id: string;
    position_id: string;
    municipality_id?: string;
    zone_id?: string;
    polling_station_id?: string;
    polling_table_id?: string;
  }) => {
    const res = await axiosInstance.post('/team/assignments', data);
    return res.data.data;
  }
};
