import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID de la zona es obligatorio' })
  zone_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del puesto de votacin es obligatorio' })
  name: string;
}

export class CreateTableDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del puesto de votacin es obligatorio' })
  polling_station_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El nmero de mesa es obligatorio' })
  table_number: string;
}
