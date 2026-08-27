import { IsString, IsOptional, IsNumber, IsJSON, IsIn } from 'class-validator';

export class CreateSimulationDto {
  @IsString()
  name: string;

  @IsString()
  parameters_json: string; // Parámetros en formato JSON
}

export class ResolveAnomalyDto {
  @IsString()
  @IsIn(['IN_REVIEW', 'CONFIRMED', 'DISMISSED'])
  status: string;

  @IsString()
  resolution_note: string;
}

export class ChatQueryDto {
  @IsString()
  prompt: string;
}

export class RegisterModelDto {
  @IsString()
  name: string;

  @IsString()
  version: string;

  @IsString()
  @IsIn(['ANOMALY', 'FORECAST', 'SIMULATION'])
  type: string;

  @IsString()
  algorithm: string;

  @IsString()
  @IsOptional()
  metrics_json?: string;
}
