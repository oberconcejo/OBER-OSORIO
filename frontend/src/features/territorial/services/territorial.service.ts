import { axiosInstance } from '../../../lib/axios';

export interface CoverageStats {
  total_tables: number;
  covered_tables: number;
  uncovered_tables: number;
  percentage: number;
}

export const territorialService = {
  getTree: async () => {
    const res = await axiosInstance.get('/territories/tree');
    return res.data.data;
  },
  
  getCoverage: async (): Promise<CoverageStats> => {
    const res = await axiosInstance.get('/territories/coverage');
    return res.data.data;
  }
};
