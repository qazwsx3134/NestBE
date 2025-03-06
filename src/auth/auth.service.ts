import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { hash, verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
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
    // const payload: AuthJwtPayload = {
    //   sub: userId,
    // };
    // const token = await this.jwtService.sign(payload);
    // const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    // argon2 hash is more secure and fast
    // const hashedRefreshToken = await hash(refreshToken);

    await this.usersService.insertRefreshToken(userId, refreshToken);

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = {
      sub: userId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.userAuthTokenFindOne(
      userId,
      refreshToken,
    );

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // const refreshTokenMatch = await verify(user.refreshToken, refreshToken);
    if (refreshToken !== user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      id: userId,
    };
  }

  async refreshToken(userId: number, oldRefreshToken: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    // argon2 hash is more secure and fast
    // const hashedRefreshToken = await hash(refreshToken);

    await this.usersService.updateRefreshToken(
      userId,
      oldRefreshToken,
      refreshToken,
    );

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async signout(userId: number, oldRefreshToken: string) {
    await this.usersService.updateRefreshToken(userId, oldRefreshToken, null);
  }
}
