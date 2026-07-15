import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { createInventoryItemSchema, updateInventoryItemSchema, adjustStockSchema } from './inventory.validation';

export class InventoryController {
  private readonly inventoryService = new InventoryService();

  list = async (_req: Request, res: Response) => {
    const items = await this.inventoryService.list();
    res.json({ items });
  };

  create = async (req: Request, res: Response) => {
    const parsed = createInventoryItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    const item = await this.inventoryService.create(parsed.data);
    res.status(201).json({ item });
  };

  update = async (req: Request, res: Response) => {
    const parsed = updateInventoryItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const item = await this.inventoryService.update(Number(req.params.id), parsed.data);
      res.json({ item });
    } catch {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.inventoryService.delete(Number(req.params.id));
      res.json({ message: 'Inventory item deleted' });
    } catch {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  };

  adjust = async (req: Request, res: Response) => {
    const parsed = adjustStockSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const item = await this.inventoryService.adjustStock(Number(req.params.id), parsed.data);
      res.json({ item });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not adjust stock';
      if (message === 'Inventory item not found') {
        res.status(404).json({ message });
        return;
      }
      res.status(400).json({ message });
    }
  };
}
