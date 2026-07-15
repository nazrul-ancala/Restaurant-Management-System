import type { z } from 'zod';
import type { RoleName } from '../../constants/roles';
import { getIO } from '../../lib/socket';
import { AuditLogService } from '../audit-logs';
import { OrderRepository } from './order.repository';
import type { createOrderSchema, updateOrderStatusSchema } from './order.validation';
import {
  ORDER_TYPES_REQUIRING_TABLE,
  TERMINAL_STATUSES,
  NEXT_STATUS,
  PREV_STATUS,
  TRANSITION_ROLES,
  CANCEL_ROLES,
} from './order.constants';

type CreateOrderInput = z.infer<typeof createOrderSchema>;
type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

function toOrderResponse(order: any) {
  return {
    id: order.id,
    orderType: order.orderType,
    table: order.table ? { id: order.table.id, name: order.table.name } : null,
    items: order.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      menuItem: { id: item.menuItem.id, name: item.menuItem.name, price: item.menuItem.price },
    })),
    status: order.status,
    total: order.total,
    paymentMethod: order.payment?.method ?? null,
    createdBy: order.createdBy ? { name: order.createdBy.name } : null,
    createdAt: order.createdAt,
  };
}

export class OrderService {
  private readonly orderRepository = new OrderRepository();
  private readonly auditLogService = new AuditLogService();

  async list() {
    const orders = await this.orderRepository.findAll();
    return orders.map(toOrderResponse);
  }

  async create(input: CreateOrderInput, employeeId?: number) {
    const requiresTable = ORDER_TYPES_REQUIRING_TABLE.includes(input.orderType);
    if (requiresTable && !input.tableId) throw new Error('Table is required for this order type');
    if (!requiresTable && input.tableId) throw new Error('Takeaway orders cannot have a table');

    if (requiresTable && input.tableId) {
      const activeCount = await this.orderRepository.countActiveByTable(input.tableId);
      if (activeCount > 0) throw new Error('Table already has an active order');
    }

    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await this.orderRepository.findMenuItemsByIds(menuItemIds);
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    for (const line of input.items) {
      const menuItem = menuItemMap.get(line.menuItemId);
      if (!menuItem) throw new Error('Menu item not found');
      if (menuItem.status !== 'available') throw new Error(`${menuItem.name} is not available`);
    }

    const items = input.items.map((line) => {
      const menuItem = menuItemMap.get(line.menuItemId)!;
      return { menuItemId: line.menuItemId, quantity: line.quantity, unitPrice: Number(menuItem.price) };
    });
    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const order = await this.orderRepository.create({
      orderType: input.orderType,
      tableId: input.tableId,
      createdById: employeeId,
      total,
      items,
    });

    const response = toOrderResponse(order);
    getIO().emit('order:created', response);
    return response;
  }

  async updateStatus(id: number, input: UpdateOrderStatusInput, employeeRole: RoleName, employeeId?: number) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error('Order not found');

    const current = order.status;
    const target = input.status;
    const isTerminal = TERMINAL_STATUSES.includes(current);

    const isForward = NEXT_STATUS[current] === target;
    const isRecall = !isTerminal && PREV_STATUS[current] === target;
    const isCancel = !isTerminal && target === 'Cancelled';
    // The one transition allowed OUT of a terminal status.
    const isRefund = current === 'Completed' && target === 'Refunded';

    if (!isForward && !isRecall && !isCancel && !isRefund) throw new Error('Invalid status transition');

    const transitionKey = `${current}->${target}`;
    const allowedRoles = isCancel ? CANCEL_ROLES : TRANSITION_ROLES[transitionKey];
    if (!allowedRoles?.includes(employeeRole)) throw new ForbiddenError();

    let payment: { method: string; amount: number } | undefined;
    if (target === 'Completed') {
      if (!input.paymentMethod) throw new Error('Payment method is required to complete an order');
      payment = { method: input.paymentMethod, amount: Number(order.total) };
    }

    let refund: { reason: string } | undefined;
    if (isRefund) {
      if (!input.refundReason) throw new Error('A reason is required to refund an order');
      refund = { reason: input.refundReason };
    }

    const readyAt = target === 'Ready' ? new Date() : undefined;
    const updated = await this.orderRepository.updateStatus(id, target, payment, refund, readyAt);
    const response = toOrderResponse(updated);
    getIO().emit('order:statusChanged', response);

    if (isRefund) {
      await this.auditLogService.log({
        employeeId,
        action: 'order.refund',
        entityType: 'Order',
        entityId: id,
        details: input.refundReason,
      });
    }

    return response;
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden');
  }
}
