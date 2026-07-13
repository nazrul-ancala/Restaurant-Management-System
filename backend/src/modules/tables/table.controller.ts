import { Request, Response } from 'express';
import { TableService } from './table.service';
import { createTableSchema, updateTableSchema } from './table.validation';

export class TableController {
  private readonly tableService = new TableService();

  list = async (_req: Request, res: Response) => {
    const tables = await this.tableService.list();
    res.json({ tables });
  };

  create = async (req: Request, res: Response) => {
    const parsed = createTableSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    const table = await this.tableService.create(parsed.data);
    res.status(201).json({ table });
  };

  update = async (req: Request, res: Response) => {
    const parsed = updateTableSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const table = await this.tableService.update(Number(req.params.id), parsed.data);
      res.json({ table });
    } catch {
      res.status(404).json({ message: 'Table not found' });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.tableService.delete(Number(req.params.id));
      res.json({ message: 'Table deleted' });
    } catch {
      res.status(404).json({ message: 'Table not found' });
    }
  };
}
