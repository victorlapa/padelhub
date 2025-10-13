import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  sub: string; // Google user ID
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables');
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  async verifyGoogleToken(token: string): Promise<GoogleTokenPayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return {
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        sub: payload.sub,
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async authenticateWithGoogle(credential: string): Promise<{
    success: boolean;
    user: User;
    token: string;
  }> {
    // Verify the Google token
    const googleUser = await this.verifyGoogleToken(credential);

    // Find or create user
    let user = await this.usersService.findByEmailOrGoogleId(
      googleUser.email,
      googleUser.sub,
    );

    if (!user) {
      // Create new user from Google data
      user = await this.usersService.createFromGoogle({
        email: googleUser.email,
        firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'User',
        lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
        profilePictureUrl: googleUser.picture,
        googleId: googleUser.sub,
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user = await this.usersService.updateGoogleId(user.id, googleUser.sub);
    }

    // Generate a simple token (in production, use JWT)
    const token = this.generateToken(user);

    return {
      success: true,
      user,
      token,
    };
  }

  private generateToken(user: User): string {
    // For now, return a simple token
    // In production, use @nestjs/jwt to generate proper JWT tokens
    return `token_${user.id}_${Date.now()}`;
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      // Extract user ID from simple token
      // In production, use JWT verification
      const match = token.match(/^token_([a-f0-9-]+)_\d+$/);
      if (!match) {
        return null;
      }

      const userId = match[1];
      return await this.usersService.findOne(userId);
    } catch {
      return null;
    }
  }
}
