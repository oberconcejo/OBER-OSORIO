import { IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class AssignTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'El colaborador es obligatorio' })
  member_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol (posicin) es obligatorio' })
  position_id: string;

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
