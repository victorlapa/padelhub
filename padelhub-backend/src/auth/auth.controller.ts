import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async authenticateWithGoogle(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.authenticateWithGoogle(googleAuthDto.credential);
  }

  @Get('verify')
  async verifyToken(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authorization.substring(7); // Remove 'Bearer ' prefix
    const user = await this.authService.verifyToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      success: true,
      user,
    };
  }
}
