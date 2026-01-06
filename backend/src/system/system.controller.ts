import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '@prisma/client';
import { IsNumber } from 'class-validator';

class UpdateAuctionConfigDto {
  @IsNumber()
  extensionTriggerTime: number;

  @IsNumber()
  extensionDuration: number;
}

@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {}

  @Get('config/auction')
  async getAuctionConfig() {
    return this.systemService.getAuctionConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Put('config/auction')
  async updateAuctionConfig(
    @GetUser() user: User,
    @Body() dto: UpdateAuctionConfigDto,
  ) {
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    await this.systemService.setValue(
      'AUCTION_EXTENSION_TRIGGER_MINUTES',
      dto.extensionTriggerTime.toString(),
    );
    await this.systemService.setValue(
      'AUCTION_EXTENSION_DURATION_MINUTES',
      dto.extensionDuration.toString(),
    );

    return { message: 'Configuration updated successfully' };
  }
}
