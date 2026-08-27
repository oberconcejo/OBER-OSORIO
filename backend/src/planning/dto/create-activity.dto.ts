import { IsString, IsOptional, IsDateString, IsIn, IsArray } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  plan_id: string;

  @IsString()
  @IsOptional()
  objective_id?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['REUNION', 'VISITA', 'CAPACITACION', 'ORGANIZACION', 'SEGUIMIENTO', 'COMUNICACION', 'LOGISTICA', 'ADMINISTRATIVA', 'OTRA'])
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
  start_date: string;

  @IsDateString()
  due_date: string;

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignee_ids?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependency_ids?: string[];
}

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['REUNION', 'VISITA', 'CAPACITACION', 'ORGANIZACION', 'SEGUIMIENTO', 'COMUNICACION', 'LOGISTICA', 'ADMINISTRATIVA', 'OTRA'])
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
  start_date?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignee_ids?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependency_ids?: string[];
}

export class ActivityStatusDto {
  @IsString()
  @IsIn(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'BLOQUEADA', 'CANCELADA'])
  status: string;
}
