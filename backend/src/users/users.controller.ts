import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  CreateUpgradeRequestDto,
  ProcessUpgradeRequestDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Public endpoint - no auth required
  @Public()
  @Get(':id/public')
  getPublicProfile(@Param('id') userId: string) {
    return this.usersService.getPublicProfile(userId);
  }

  @Get('me')
  getProfile(@GetUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('me/ratings')
  getRatings(@GetUser('id') userId: string) {
    return this.usersService.getRatings(userId);
  }

  @Post('upgrade-request')
  @Roles(UserRole.BIDDER)
  @UseGuards(RolesGuard)
  createUpgradeRequest(
    @GetUser('id') userId: string,
    @Body() dto: CreateUpgradeRequestDto,
  ) {
    return this.usersService.createUpgradeRequest(userId, dto);
  }

  @Get('admin/upgrade-requests')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getUpgradeRequests() {
    return this.usersService.getUpgradeRequests();
  }

  @Patch('admin/upgrade-requests/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  processUpgradeRequest(
    @Param('id') requestId: string,
    @Body() dto: ProcessUpgradeRequestDto,
    @GetUser('id') adminId: string,
  ) {
    return this.usersService.processUpgradeRequest(requestId, dto, adminId);
  }
}
