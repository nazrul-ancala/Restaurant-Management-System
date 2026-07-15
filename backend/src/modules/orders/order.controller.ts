import { Request, Response } from 'express';
import type { RoleName } from '../../constants/roles';
import { OrderService, ForbiddenError } from './order.service';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation';

const NOT_FOUND_MESSAGES = ['Order not found', 'Menu item not found'];
const CONFLICT_MESSAGES = ['Table already has an active order'];

export class OrderController {
  private readonly orderService = new OrderService();

  list = async (_req: Request, res: Response) => {
    const orders = await this.orderService.list();
    res.json({ orders });
  };

  create = async (req: Request, res: Response) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const order = await this.orderService.create(parsed.data, req.employee!.id);
      res.status(201).json({ order });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const order = await this.orderService.updateStatus(
        Number(req.params.id),
        parsed.data,
        req.employee!.role as RoleName
      );
      res.json({ order });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  private handleError(err: unknown, res: Response) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ message: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'Request failed';
    if (NOT_FOUND_MESSAGES.includes(message)) {
      res.status(404).json({ message });
      return;
    }
    if (CONFLICT_MESSAGES.includes(message)) {
      res.status(409).json({ message });
      return;
    }
    res.status(400).json({ message });
  }
}
