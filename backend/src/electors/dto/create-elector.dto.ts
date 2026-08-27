import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateElectorDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  @IsIn(['CC', 'TI', 'CE', 'PASAPORTE'], { message: 'Tipo de documento invlido' })
  document_type: string;

  @IsString()
  @IsNotEmpty({ message: 'El nmero de documento es obligatorio' })
  document_number: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  last_name: string;
}
