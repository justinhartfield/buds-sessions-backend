import { IsUUID } from 'class-validator';

export class RequestKitDto {
  @IsUUID()
  kitId: string;

  @IsUUID()
  sessionId: string;
}
