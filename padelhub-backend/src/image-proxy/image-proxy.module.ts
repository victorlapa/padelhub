import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ImageProxyController } from './image-proxy.controller';
import { ImageProxyService } from './image-proxy.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 86400000, // 24 hours in milliseconds
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [ImageProxyController],
  providers: [ImageProxyService],
})
export class ImageProxyModule {}
