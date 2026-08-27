import { insforge } from '../lib/insforgeClient';
import { AuthUser } from '../types';

export const writeAuditLog = async (
  user: Partial<AuthUser> | null,
  action: string,
  category: string,
  details: string,
  result: 'Éxito' | 'Fallo',
  ipAddress?: string
) => {
  try {
    const email = user?.email || 'anonimo@campana.ai';
    const name = user?.name || 'Usuario Anónimo';
    const clientId = user?.clientId || 'c-101';
    const clientName = user?.clientName || 'Campaña Ganadora AI';

    const logEntry = {
      id: 'log-' + Math.floor(Math.random() * 900000 + 100000),
      timestamp: new Date().toISOString(),
      user_id_ref: user?.role || 'anonimo',
      user_name: name,
      user_email: email,
      client_id: clientId,
      client_name: clientName,
      action: action,
      category: category,
      details: details,
      ip_address: ipAddress || '192.168.1.1',
      result: result
    };

    // Safe background insert of audit log to InsForge
    const { error } = await insforge.database.from('audit_logs').insert([logEntry]);
    if (error) {
      console.warn('Fallo al guardar log de auditoría en InsForge:', error);
    }
  } catch (error) {
    console.error('Error al escribir log de auditoría:', error);
  }
};
