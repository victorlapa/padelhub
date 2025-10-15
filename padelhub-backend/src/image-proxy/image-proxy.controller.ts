import {
  Controller,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ImageProxyService } from './image-proxy.service';

@Controller('api/image-proxy')
export class ImageProxyController {
  constructor(private readonly imageProxyService: ImageProxyService) {}

  @Get()
  async getImage(
    @Query('url') imageUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!imageUrl) {
      throw new HttpException('URL parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Validate that the URL is from Google domains (security measure)
    if (!this.isAllowedDomain(imageUrl)) {
      throw new HttpException(
        'Only Google domains are allowed',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const { buffer, contentType } = await this.imageProxyService.fetchImage(imageUrl);

      // Set cache headers (cache for 24 hours)
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isAllowedDomain(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedDomains = [
        'googleusercontent.com',
        'ggpht.com',
        'googleapis.com',
      ];
      return allowedDomains.some((domain) => urlObj.hostname.endsWith(domain));
    } catch {
      return false;
    }
  }
}
