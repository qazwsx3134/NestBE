import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Needed register in the app.module
 * Controller is the container for handling the http endpoints
 * like GET, POST, PUT, DELETE
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
