import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreatePlanDto {
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
  @IsIn(['DRAFT', 'ACTIVE', 'PAUSADO', 'COMPLETADO', 'CANCELADO'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  priority?: string;

  @IsString()
  @IsOptional()
  municipality_id?: string;

  @IsString()
  @IsOptional()
  zone_id?: string;

  @IsString()
  @IsOptional()
  polling_station_id?: string;
}

export class UpdatePlanDto {
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
  @IsIn(['DRAFT', 'ACTIVE', 'PAUSADO', 'COMPLETADO', 'CANCELADO'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])
  priority?: string;
}
