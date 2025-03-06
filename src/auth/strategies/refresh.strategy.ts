import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Inject, Injectable } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Tell passport to get the token from the header
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true, // 需要把req傳進來
    });
  }
  // 有AuthGuard("jwt")包著的路由才會觸發這個strategy
  // 會先驗證token 驗證完後會trigger validate

  validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();

    console.log(refreshToken);

    // return的object會掛在req.user
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
