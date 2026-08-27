import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la posicin (rol) es obligatorio' })
  name: string;
}

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
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

  @IsString()
  @IsOptional()
  phone?: string;
}
