import { prisma } from '../../lib/prisma';
import { TERMINAL_STATUSES } from './order.constants';

const INCLUDE = {
  table: true,
  createdBy: true,
  payment: true,
  items: { include: { menuItem: true } },
} as const;

export class OrderRepository {
  findAll() {
    return prisma.order.findMany({ include: INCLUDE, orderBy: { id: 'asc' } });
  }

  findById(id: number) {
    return prisma.order.findUnique({ where: { id }, include: INCLUDE });
  }

  findMenuItemsByIds(ids: number[]) {
    return prisma.menuItem.findMany({ where: { id: { in: ids } } });
  }

  countActiveByTable(tableId: number) {
    return prisma.order.count({
      where: { tableId, status: { notIn: TERMINAL_STATUSES } },
    });
  }

  create(data: {
    orderType: string;
    tableId?: number;
    createdById?: number;
    total: number;
    items: Array<{ menuItemId: number; quantity: number; unitPrice: number }>;
  }) {
    return prisma.order.create({
      data: {
        orderType: data.orderType,
        tableId: data.tableId,
        createdById: data.createdById,
        total: data.total,
        items: { create: data.items },
      },
      include: INCLUDE,
    });
  }

  async updateStatus(
    id: number,
    status: string,
    payment?: { method: string; amount: number },
    refund?: { reason: string },
    readyAt?: Date
  ) {
    const data = { status, ...(readyAt ? { readyAt } : {}) };

    if (payment) {
      return prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: { orderId: id, method: payment.method, amount: payment.amount, status: 'Paid' },
        });
        return tx.order.update({ where: { id }, data, include: INCLUDE });
      });
    }
    if (refund) {
      return prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: 'Refunded', refundReason: refund.reason, refundedAt: new Date() },
        });
        return tx.order.update({ where: { id }, data, include: INCLUDE });
      });
    }
    return prisma.order.update({ where: { id }, data, include: INCLUDE });
  }
}
