import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface ImageData {
  buffer: Buffer;
  contentType: string;
}

@Injectable()
export class ImageProxyService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async fetchImage(url: string): Promise<ImageData> {
    // Check cache first
    const cacheKey = `image:${url}`;
    const cached = await this.cacheManager.get<ImageData>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch from Google
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    const imageData: ImageData = {
      buffer,
      contentType,
    };

    // Cache for 24 hours (86400 seconds)
    await this.cacheManager.set(cacheKey, imageData, 86400000);

    return imageData;
  }
}
