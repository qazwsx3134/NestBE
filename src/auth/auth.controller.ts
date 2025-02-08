import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { el } from '@faker-js/faker/.';

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
    const token = await this.authService.login(req.user.id);

    return { id: req.user, token };
  }
}
