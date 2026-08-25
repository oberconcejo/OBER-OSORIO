import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: { include: { permissions: { include: { permission: true } } } } }
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('La cuenta está suspendida o inactiva.');
    }

    const userPermissions = user.role.permissions.map(rp => rp.permission.name);

    const payload = { 
      sub: user.id, 
      email: user.email, 
      organizationId: user.organization_id, 
      permissions: userPermissions 
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' })
    };
  }
}
