import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { updateSettingsSchema } from './settings.validation';

export class SettingsController {
  private readonly settingsService = new SettingsService();

  get = async (_req: Request, res: Response) => {
    const settings = await this.settingsService.get();
    res.json({ settings });
  };

  update = async (req: Request, res: Response) => {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });
      return;
    }
    const settings = await this.settingsService.update(parsed.data);
    res.json({ settings });
  };
}
