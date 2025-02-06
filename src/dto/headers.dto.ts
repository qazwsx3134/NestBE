import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class HeadersDto {
  @IsString()
  @Expose({ name: 'access-token' }) // Expose means that this property will be serialized to the response
  accessToken: string;
}
