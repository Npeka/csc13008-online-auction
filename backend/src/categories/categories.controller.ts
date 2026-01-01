import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiResponse } from '../common/interfaces/common.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll(
    @Query('includeProducts') includeProducts?: string,
  ): Promise<ApiResponse> {
    const shouldIncludeProducts = includeProducts === 'true';
    const categories = await this.categoriesService.findAll(
      shouldIncludeProducts,
    );

    return {
      success: true,
      data: categories,
    };
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<ApiResponse> {
    const category = await this.categoriesService.findBySlug(slug);

    return {
      success: true,
      data: category,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    const category = await this.categoriesService.findOne(id);

    return {
      success: true,
      data: category,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<ApiResponse> {
    const category = await this.categoriesService.create(dto);

    return {
      success: true,
      data: category,
      message: 'Category created successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<ApiResponse> {
    const category = await this.categoriesService.update(id, dto);

    return {
      success: true,
      data: category,
      message: 'Category updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    const result = await this.categoriesService.remove(id);

    return {
      success: true,
      data: result,
      message: 'Category deleted successfully',
    };
  }
}
