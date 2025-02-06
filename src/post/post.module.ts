import { Module, ValidationPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [PostController],
  providers: [
    PostService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
  imports: [DrizzleModule],
})
export class PostModule {}
