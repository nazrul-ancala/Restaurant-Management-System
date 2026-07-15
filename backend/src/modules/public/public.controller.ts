import { Request, Response } from 'express';
import { TableService } from '../tables';
import { MenuService } from '../menu';
import { OrderService } from '../orders';
import { SettingsService } from '../settings';
import { createPublicOrderSchema } from './public.validation';

const NOT_FOUND_MESSAGES = ['Table not found', 'Order not found', 'Menu item not found'];
const CONFLICT_MESSAGES = ['Table already has an active order'];

export class PublicController {
  private readonly tableService = new TableService();
  private readonly menuService = new MenuService();
  private readonly orderService = new OrderService();
  private readonly settingsService = new SettingsService();

  // Restaurant name/address/phone/hours are already displayed on the public
  // Landing page -- none of it is sensitive, so this is deliberately unauthenticated.
  getSettings = async (_req: Request, res: Response) => {
    const settings = await this.settingsService.get();
    res.json({ settings });
  };

  getTable = async (req: Request, res: Response) => {
    try {
      const table = await this.tableService.getByQrCode(req.params.qrCode);
      res.json({ table: { id: table.id, name: table.name } });
    } catch {
      res.status(404).json({ message: 'Table not found' });
    }
  };

  getMenu = async (_req: Request, res: Response) => {
    const items = await this.menuService.listAvailable();
    res.json({ items });
  };

  createOrder = async (req: Request, res: Response) => {
    const parsed = createPublicOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const table = await this.tableService.getByQrCode(parsed.data.qrCode);
      const order = await this.orderService.create(
        { orderType: 'QR Order', tableId: table.id, items: parsed.data.items },
        undefined
      );
      res.status(201).json({ order });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  private handleError(err: unknown, res: Response) {
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
