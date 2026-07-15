import { prisma } from '../../lib/prisma';

const INCLUDE = { movements: { orderBy: { createdAt: 'desc' as const } } };

export class InventoryRepository {
  findAll() {
    return prisma.inventoryItem.findMany({ include: INCLUDE, orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return prisma.inventoryItem.findUnique({ where: { id }, include: INCLUDE });
  }

  create(data: {
    name: string;
    category: string;
    unit: string;
    quantity: number;
    reorderThreshold: number;
    costPerUnit: number;
  }) {
    return prisma.inventoryItem.create({ data, include: INCLUDE });
  }

  update(
    id: number,
    data: Partial<{ name: string; category: string; unit: string; reorderThreshold: number; costPerUnit: number }>
  ) {
    return prisma.inventoryItem.update({ where: { id }, data, include: INCLUDE });
  }

  delete(id: number) {
    return prisma.inventoryItem.delete({ where: { id } });
  }

  createMovementAndUpdateQuantity(itemId: number, type: string, delta: number, note: string | undefined) {
    return prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({ data: { inventoryItemId: itemId, type, delta, note } });
      return tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { increment: delta } },
        include: INCLUDE,
      });
    });
  }
}
