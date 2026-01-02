import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async findAll(includeProducts = false) {
    return this.categoriesRepository.findAll(includeProducts);
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findBySlug(slug);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findUnique({ id });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    // Check if slug is unique
    const existingCategory = await this.categoriesRepository.findUnique({
      slug: dto.slug,
    });

    if (existingCategory) {
      throw new BadRequestException('Category slug already exists');
    }

    // If parentId is provided, check if parent exists
    if (dto.parentId) {
      const parent = await this.categoriesRepository.findUnique({
        id: dto.parentId,
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.categoriesRepository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findUnique({ id });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if slug is unique (excluding current category)
    if (dto.slug) {
      const existingCategory = await this.categoriesRepository.findFirst({
        slug: dto.slug,
        NOT: { id },
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

      const parent = await this.categoriesRepository.findUnique({
        id: dto.parentId,
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

    return this.categoriesRepository.update(id, dto);
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findUnique(
      { id },
      {
        _count: {
          select: { products: true },
        },
      },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has products
    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    // Check if category has children
    const childrenCount = await this.categoriesRepository.count({
      parentId: id,
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories',
      );
    }

    await this.categoriesRepository.delete(id);

    return { message: 'Category deleted successfully' };
  }

  private async isDescendant(
    potentialParentId: string,
    categoryId: string,
  ): Promise<boolean> {
    const parentId =
      await this.categoriesRepository.getParentId(potentialParentId);

    if (!parentId) {
      return false;
    }

    if (parentId === categoryId) {
      return true;
    }

    return this.isDescendant(parentId, categoryId);
  }
}
