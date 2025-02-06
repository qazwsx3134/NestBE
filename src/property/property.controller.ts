import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreatePropertyZodDto,
  createPropertyZodSchema,
} from 'src/dto/createPropertyZod.dto';
import { HeadersDto } from 'src/dto/headers.dto';
import { ParseIdPipe } from 'src/pipes/parseIdPipe';
import { RequestHeader } from 'src/pipes/request-header';
import { ZodValidationPipe } from 'src/pipes/zodValidationPipe';
import { PropertyService } from './property.service';

@Controller('property')
export class PropertyController {
  // Service is for dependency injection, putting business logic in the service.
  // propertyService: PropertyService;

  constructor(private propertyService: PropertyService) {
    // Don't do this(create dependency in constructor), using dependency injection instead
    // this.propertyService = new PropertyService();
  }
  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createPropertyZodSchema))
  create(@Body() body: CreatePropertyZodDto) {
    return this.propertyService.create();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIdPipe) id,
    @Body() body: CreatePropertyZodDto,
    @RequestHeader(new ValidationPipe({ validateCustomDecorators: true })) // pass in ValidationPipe to validate custom decorators which are defined in RequestHeader
    header: HeadersDto,
  ) {
    return this.propertyService.update();
  }
}
