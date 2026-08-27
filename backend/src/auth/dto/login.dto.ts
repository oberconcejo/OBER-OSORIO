import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrnico no es vlido' })
  @IsNotEmpty({ message: 'El correo electrnico es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'La contrasea es obligatoria' })
  @MinLength(6, { message: 'La contrasea debe tener al menos 6 caracteres' })
  password: string;
}
