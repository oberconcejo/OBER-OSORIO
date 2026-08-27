import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateObjectiveDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsString()
  @IsOptional()
  assignee_id?: string;
}

export class UpdateObjectiveDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsString()
  @IsOptional()
  assignee_id?: string;
}
