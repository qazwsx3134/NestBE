import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);

    if (!user) throw new UnauthorizedException("User doesn't exist");

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(userId: number) {
    const payload: AuthJwtPayload = {
      sub: userId,
    };
    return this.jwtService.sign(payload);
  }
}
