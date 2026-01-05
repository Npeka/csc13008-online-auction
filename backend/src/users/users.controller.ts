import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  CreateUpgradeRequestDto,
  ProcessUpgradeRequestDto,
  CreateUserDto,
  AdminUpdateUserDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

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

  // Admin routes - must be BEFORE dynamic :id routes
  @Get('admin/upgrade-requests')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getUpgradeRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED',
  ) {
    return this.usersService.getUpgradeRequests({ page, limit, status });
  }

  @Post('admin/users')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  createAdminUser(@Body() dto: CreateUserDto) {
    return this.usersService.createAdminUser(dto);
  }

  @Get('admin/users/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getAdminUser(@Param('id') id: string) {
    return this.usersService.getAdminUser(id);
  }

  @Delete('admin/users/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  deleteAdminUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch('admin/users/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  updateAdminUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.updateAdminUser(id, dto);
  }

  @Get('admin/users')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getUsers({ search, role, page, limit });
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

  // Public endpoint - MUST be at the end because :id is dynamic
  @Public()
  @Get(':id/public')
  getPublicProfile(@Param('id') userId: string) {
    return this.usersService.getPublicProfile(userId);
  }
}
