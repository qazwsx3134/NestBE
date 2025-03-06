import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    /**
     * req.user is the user that passport authenticated, passed by local.strategy
     */

    return await this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();

    return this.authService.refreshToken(req.user.id, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signout(@Req() req) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    this.authService.signout(req.user.id, refreshToken);
  }
}
