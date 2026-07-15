import { Request, Response } from 'express';
import { MenuService, ConflictError } from './menu.service';
import { createMenuItemSchema, updateMenuItemSchema } from './menu.validation';

export class MenuController {
  private readonly menuService = new MenuService();

  list = async (_req: Request, res: Response) => {
    const items = await this.menuService.list();
    res.json({ items });
  };

  create = async (req: Request, res: Response) => {
    const parsed = createMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    const item = await this.menuService.create(parsed.data);
    res.status(201).json({ item });
  };

  update = async (req: Request, res: Response) => {
    const parsed = updateMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    try {
      const item = await this.menuService.update(Number(req.params.id), parsed.data);
      res.json({ item });
    } catch {
      res.status(404).json({ message: 'Menu item not found' });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.menuService.delete(Number(req.params.id));
      res.json({ message: 'Menu item deleted' });
    } catch (err) {
      if (err instanceof ConflictError) {
        res.status(409).json({ message: err.message });
        return;
      }
      res.status(404).json({ message: 'Menu item not found' });
    }
  };

  uploadImage = (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/menu/${req.file.filename}`;
    res.json({ imageUrl });
  };
}
