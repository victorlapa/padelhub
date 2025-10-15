import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Message is too long (max 1000 characters)' })
  message: string;
}
