import { axiosInstance } from '../../../lib/axios';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },
};
