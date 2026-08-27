import { axiosInstance } from '../../../lib/axios';

export interface Elector {
  id: string;
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

export interface CreateElectorDto {
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
}

export const electorsService = {
  getAll: async (search?: string): Promise<Elector[]> => {
    const params = search ? { search } : {};
    const response = await axiosInstance.get('/electors', { params });
    return response.data.data;
  },

  create: async (data: CreateElectorDto): Promise<Elector> => {
    const response = await axiosInstance.post('/electors', data);
    return response.data.data;
  },
};
