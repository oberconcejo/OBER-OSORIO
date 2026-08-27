import { IsString, IsOptional, IsDateString, IsIn, IsNumber } from 'class-validator';

export class CreateOperationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BORRADOR', 'PROGRAMADA', 'ACTIVA', 'PAUSADA', 'COMPLETADA', 'CANCELADA'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  priority?: string;
}

export class UpdateOperationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BORRADOR', 'PROGRAMADA', 'ACTIVA', 'PAUSADA', 'COMPLETADA', 'CANCELADA'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  priority?: string;
}

export class CreateOperationDayDto {
  @IsString()
  operation_id: string;

  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsString()
  @IsOptional()
  @IsIn(['PROGRAMADA', 'ACTIVA', 'COMPLETADA'])
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateOperationDayDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsString()
  @IsOptional()
  end_time?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PROGRAMADA', 'ACTIVA', 'COMPLETADA'])
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateMobilizationActivityDto {
  @IsString()
  operation_id: string;

  @IsString()
  @IsOptional()
  operation_day_id?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Coordinacion', 'Reunion', 'Visita', 'Capacitacion', 'Logistica', 'Comunicacion', 'Apoyo operativo', 'Seguimiento', 'Otro'])
  type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  priority?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'BLOQUEADA', 'CANCELADA'])
  status?: string;

  @IsDateString()
  start_date_time: string;

  @IsDateString()
  end_date_time: string;

  @IsString()
  @IsOptional()
  municipality_id?: string;

  @IsString()
  @IsOptional()
  zone_id?: string;

  @IsString()
  @IsOptional()
  polling_station_id?: string;

  @IsString()
  @IsOptional()
  polling_table_id?: string;

  @IsString()
  @IsOptional()
  assigned_to_id?: string;
}

export class UpdateMobilizationActivityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Coordinacion', 'Reunion', 'Visita', 'Capacitacion', 'Logistica', 'Comunicacion', 'Apoyo operativo', 'Seguimiento', 'Otro'])
  type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  priority?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'BLOQUEADA', 'CANCELADA'])
  status?: string;

  @IsDateString()
  @IsOptional()
  start_date_time?: string;

  @IsDateString()
  @IsOptional()
  end_date_time?: string;

  @IsString()
  @IsOptional()
  municipality_id?: string;

  @IsString()
  @IsOptional()
  zone_id?: string;

  @IsString()
  @IsOptional()
  polling_station_id?: string;

  @IsString()
  @IsOptional()
  polling_table_id?: string;

  @IsString()
  @IsOptional()
  assigned_to_id?: string;
}

export class CreateIncidentDto {
  @IsString()
  @IsOptional()
  operation_id?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  @IsIn(['Retraso', 'Logistica', 'Comunicacion', 'Personal', 'Transporte', 'Ubicacion', 'Clima', 'Tecnica', 'Otra'])
  type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  severity?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ABIERTA', 'EN_REVISION', 'EN_PROCESO', 'RESUELTA', 'CERRADA'])
  status?: string;

  @IsString()
  @IsOptional()
  reported_by_id?: string;

  @IsString()
  @IsOptional()
  municipality_id?: string;

  @IsString()
  @IsOptional()
  zone_id?: string;

  @IsString()
  @IsOptional()
  polling_station_id?: string;

  @IsString()
  @IsOptional()
  polling_table_id?: string;
}

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Retraso', 'Logistica', 'Comunicacion', 'Personal', 'Transporte', 'Ubicacion', 'Clima', 'Tecnica', 'Otra'])
  type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  severity?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ABIERTA', 'EN_REVISION', 'EN_PROCESO', 'RESUELTA', 'CERRADA'])
  status?: string;
}

export class CreateOperationalPointDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['Coordinacion', 'Reunion', 'Logistica', 'Apoyo', 'Otro'])
  type?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  responsible_id?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  status?: string;

  @IsString()
  @IsOptional()
  municipality_id?: string;

  @IsString()
  @IsOptional()
  zone_id?: string;

  @IsString()
  @IsOptional()
  polling_station_id?: string;

  @IsString()
  @IsOptional()
  polling_table_id?: string;
}

export class UpdateOperationalPointDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Coordinacion', 'Reunion', 'Logistica', 'Apoyo', 'Otro'])
  type?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  responsible_id?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  status?: string;
}

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['VEHICULO', 'EQUIPO_LOGISTICO', 'MATERIAL', 'PUNTO_APOYO', 'GENERICO'])
  type?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @IsIn(['DISPONIBLE', 'ASIGNADO', 'FUERA_SERVICIO'])
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  municipality_id?: string;

  @IsString()
  @IsOptional()
  zone_id?: string;

  @IsString()
  @IsOptional()
  polling_station_id?: string;

  @IsString()
  @IsOptional()
  polling_table_id?: string;
}

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['VEHICULO', 'EQUIPO_LOGISTICO', 'MATERIAL', 'PUNTO_APOYO', 'GENERICO'])
  type?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  @IsIn(['DISPONIBLE', 'ASIGNADO', 'FUERA_SERVICIO'])
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
