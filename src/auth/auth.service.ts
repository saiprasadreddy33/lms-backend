import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Role } from '../common/roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(params: { name: string; email: string; password: string; role?: Role }) {
    const user = await this.usersService.createUser(params);
    return this.buildToken(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.buildToken(user.id, user.email, user.role);
  }

  private async buildToken(id: string, email: string, role: Role) {
    const payload = { sub: id, email, role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id,
        email,
        role,
      },
    };
  }
}
