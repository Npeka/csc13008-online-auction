import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeProducts = false) {
    return this.prisma.category.findMany({
      where: { parentId: null }, // Only root categories
      include: {
        children: {
          include: {
            ...(includeProducts && {
              _count: {
                select: { products: true },
              },
            }),
          },
        },
        ...(includeProducts && {
          _count: {
            select: { products: true },
          },
        }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    // Check if slug is unique
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException('Category slug already exists');
    }

    // If parentId is provided, check if parent exists
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if slug is unique (excluding current category)
    if (dto.slug) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    // If parentId is provided, check if parent exists and prevent circular reference
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Check for circular reference
      const isDescendant = await this.isDescendant(dto.parentId, id);
      if (isDescendant) {
        throw new BadRequestException('Cannot create circular reference');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    // Check if category has children
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  private async isDescendant(
    potentialParentId: string,
    categoryId: string,
  ): Promise<boolean> {
    const category = await this.prisma.category.findUnique({
      where: { id: potentialParentId },
      select: { parentId: true },
    });

    if (!category || !category.parentId) {
      return false;
    }

    if (category.parentId === categoryId) {
      return true;
    }

    return this.isDescendant(category.parentId, categoryId);
  }
}
