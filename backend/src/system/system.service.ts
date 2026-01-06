import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async getValue(key: string, defaultValue: string): Promise<string> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      // If not found, we can optionally create it with default, or just return default
      // Let's just return default to avoid side effects on GET
      return defaultValue;
    }

    return config.value;
  }

  async setValue(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAuctionConfig() {
    const triggerTime = await this.getValue(
      'AUCTION_EXTENSION_TRIGGER_MINUTES',
      '5',
    );
    const duration = await this.getValue(
      'AUCTION_EXTENSION_DURATION_MINUTES',
      '10',
    );

    return {
      extensionTriggerTime: parseInt(triggerTime, 10),
      extensionDuration: parseInt(duration, 10),
    };
  }
}
