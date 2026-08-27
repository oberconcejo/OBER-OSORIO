import { axiosInstance } from '../../../lib/axios';

export interface Zone {
  id: string;
  name: string;
  municipality: {
    id: string;
    name: string;
  };
}

export interface PollingTable {
  id: string;
  table_number: string;
}

export interface PollingStation {
  id: string;
  name: string;
  zone: Zone;
  polling_tables: PollingTable[];
}

export const logisticsService = {
  getZones: async (): Promise<Zone[]> => {
    const res = await axiosInstance.get('/logistics/zones');
    return res.data.data;
  },
  
  getStations: async (): Promise<PollingStation[]> => {
    const res = await axiosInstance.get('/logistics/stations');
    return res.data.data;
  },

  createStation: async (zone_id: string, name: string): Promise<PollingStation> => {
    const res = await axiosInstance.post('/logistics/stations', { zone_id, name });
    return res.data.data;
  },

  createTable: async (polling_station_id: string, table_number: string): Promise<PollingTable> => {
    const res = await axiosInstance.post('/logistics/tables', { polling_station_id, table_number });
    return res.data.data;
  },
};
