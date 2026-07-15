import { prisma } from '../../lib/prisma';

export class MenuRepository {
  findAll() {
    return prisma.menuItem.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return prisma.menuItem.findUnique({ where: { id }, include: { category: true } });
  }

  findCategoryByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  createCategory(name: string) {
    return prisma.category.create({ data: { name } });
  }

  create(data: { name: string; categoryId: number; price: number; description?: string; imageUrl?: string | null }) {
    return prisma.menuItem.create({ data, include: { category: true } });
  }

  update(
    id: number,
    data: Partial<{
      name: string;
      categoryId: number;
      price: number;
      description: string;
      imageUrl: string | null;
      status: string;
    }>
  ) {
    return prisma.menuItem.update({ where: { id }, data, include: { category: true } });
  }

  countOrderItemsForMenuItem(id: number) {
    return prisma.orderItem.count({ where: { menuItemId: id } });
  }

  delete(id: number) {
    return prisma.menuItem.delete({ where: { id } });
  }
}
