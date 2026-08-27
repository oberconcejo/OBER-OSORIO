import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales invlidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invlidas');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name, 
      organization_id: user.organization_id 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    };
  }
}
