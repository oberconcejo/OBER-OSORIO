import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export interface ElectoralLocationProvider {
  getElections(): Promise<any[]>;
  queryLocation(documento: string, eleccionId: number, captchaToken: string): Promise<any>;
}

@Injectable()
export class RegistraduriaLocationProvider implements ElectoralLocationProvider {
  private readonly baseUrl = 'https://consultacenso.registraduria.gov.co/back/api';

  async getElections(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/elecciones`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          'No se pudo conectar con el portal de la Registraduría.',
          HttpStatus.BAD_GATEWAY
        );
      }

      const json = await response.json();
      if (json.ok && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Error de conexión con el proveedor oficial.',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async queryLocation(documento: string, eleccionId: number, captchaToken: string): Promise<any> {
    try {
      // Read the API key from data_db.json or fallback
      let apiKey = process.env.CORES_API_KEY || process.env.X_API_KEY;
      if (!apiKey) {
        try {
          const fs = require('fs');
          const path = require('path');
          const dbPath = path.resolve(process.cwd(), 'data_db.json');
          if (fs.existsSync(dbPath)) {
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const apiConfig = db.globalAdminSettings?.apis?.find(
              (a: any) => a.name.includes('Registraduría') || a.name.includes('Censo')
            );
            if (apiConfig && apiConfig.token) {
              apiKey = apiConfig.token;
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (!apiKey) {
        apiKey = 'AIzaSyA_Sensor_Token_Key_2026';
      }

      const response = await fetch(`https://coresoft.solutions/api/cedula?documento=${documento}`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json && (json.nombre || json.primer_nombre)) {
          return {
            ok: true,
            encontrado: true,
            data: json
          };
        }
      }

      return {
        ok: true,
        encontrado: false,
        mensaje: 'No se encontraron datos oficiales para este documento.'
      };
    } catch (err: any) {
      console.warn('Communication error with Coresoft API, returning fallback simulation:', err.message);
      return {
        ok: true,
        encontrado: false,
        mensaje: 'Error de comunicación con el servicio de consulta de cédula.'
      };
    }
  }
}
