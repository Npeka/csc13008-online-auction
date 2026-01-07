import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(includeProducts = false) {
    return this.prisma.category.findMany({
      where: { parentId: null }, // Only root categories
      include: {
        children: {
          include: {
            ...(includeProducts && {
              _count: {
                select: {
                  products: {
                    where: { status: ProductStatus.ACTIVE },
                  },
                },
              },
            }),
          },
        },
        ...(includeProducts && {
          _count: {
            select: {
              products: {
                where: { status: ProductStatus.ACTIVE },
              },
            },
          },
        }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE },
            },
          },
        },
      },
    });
  }

  async findUnique(
    where: Prisma.CategoryWhereUniqueInput,
    include?: Prisma.CategoryInclude,
  ) {
    return this.prisma.category.findUnique({
      where,
      include: include || {
        parent: true,
        children: true,
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE },
            },
          },
        },
      },
    });
  }

  async findFirst(where: Prisma.CategoryWhereInput) {
    return this.prisma.category.findFirst({ where });
  }

  async count(where: Prisma.CategoryWhereInput) {
    return this.prisma.category.count({ where });
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return this.prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Helper for circular dependency check
  async getParentId(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { parentId: true },
    });
    return category?.parentId;
  }

  calculateTotalProductCount(category: any): number {
    const directCount = category._count?.products || 0;
    const childrenCount =
      category.children?.reduce(
        (sum: number, child: any) =>
          sum + this.calculateTotalProductCount(child),
        0,
      ) || 0;
    return directCount + childrenCount;
  }
}
