import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Tell passport to get the token from the header
      secretOrKey: jwtConfiguration.secret,
    });
  }
  // 有AuthGuard("jwt")包著的路由才會觸發這個strategy
  // 會先驗證token 驗證完後會trigger validate

  validate(payload: AuthJwtPayload) {
    // payload已經被經過驗證  所以在這邊不需要再經過驗證

    // return的object會掛在req.user
    return {
      id: payload.sub,
    };
  }
}
