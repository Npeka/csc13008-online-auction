import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    // Parse Redis URL and configure client
    const isSecure = redisUrl.startsWith('rediss://');

    this.client = new Redis(redisUrl, {
      // Enable TLS for rediss:// URLs
      tls: isSecure ? {} : undefined,
      // Reconnect on error
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Connection timeout
      connectTimeout: 10000,
      // Max retry attempts
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis client error:', err);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });
  }

  /**
   * Set a value in cache with TTL (time to live) in seconds
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Get TTL (time to live) of a key in seconds
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * Set expiry time for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis client disconnected');
  }
}
